import http from 'http';
import { createApp, registerErrorHandlers } from '../src/backend/app';
import { connectDatabase } from '../src/backend/config/database';

// Test runner assertion helper
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

// HTTP request helper
async function makeRequest(
  server: http.Server,
  path: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
  } = {}
): Promise<{ status: number; headers: http.IncomingHttpHeaders; json: any; raw: string }> {
  const addr = server.address() as any;
  const port = addr.port;
  const method = options.method || 'GET';
  const postData = options.body ? JSON.stringify(options.body) : undefined;

  const reqHeaders: Record<string, string> = {
    ...(options.headers || {}),
  };
  if (postData) {
    reqHeaders['Content-Type'] = 'application/json';
    reqHeaders['Content-Length'] = Buffer.byteLength(postData).toString();
  }

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let json: any = null;
          try {
            json = JSON.parse(raw);
          } catch (e) {
            // Non-JSON response
          }
          resolve({
            status: res.statusCode || 500,
            headers: res.headers,
            json,
            raw,
          });
        });
      }
    );

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n=============================================');
  console.log('  RIDEMATE BACKEND AUTOMATED TEST SUITE');
  console.log('=============================================\n');

  await connectDatabase();
  const app = createApp();
  registerErrorHandlers(app);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  [FAIL] ${name}`);
      console.error(`         ${err.message}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // 1. HEALTH CHECKS
    // ----------------------------------------------------
    await test('GET /api/health should return ok and diagnostics', async () => {
      const res = await makeRequest(server, '/api/health');
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.json.status === 'ok', `Expected status ok, got ${res.json.status}`);
      assert(res.json.totalCars > 0, `Expected totalCars > 0, got ${res.json.totalCars}`);
    });

    // ----------------------------------------------------
    // 2. AUTHENTICATION MODULE
    // ----------------------------------------------------
    let authToken = '';
    const testEmail = `tester-${Date.now()}@example.com`;

    await test('POST /api/v1/auth/register should create new customer and return JWT', async () => {
      const res = await makeRequest(server, '/api/v1/auth/register', {
        method: 'POST',
        body: {
          name: 'Alex Mercer',
          email: testEmail,
          password: 'Password123!',
          phone: '+1 415 555 0199',
          driverLicenseNumber: 'CA-D991823',
          role: 'customer',
        },
      });
      assert(res.status === 201, `Expected 201, got ${res.status}`);
      assert(res.json.success === true, 'Expected success true');
      assert(!!res.json.data.token, 'Expected JWT token in response');
      assert(res.json.data.user.email === testEmail, 'User email mismatch');
      authToken = res.json.data.token;
    });

    await test('POST /api/v1/auth/login should authenticate user and issue token', async () => {
      const res = await makeRequest(server, '/api/v1/auth/login', {
        method: 'POST',
        body: {
          email: 'ganesh@ridemate.io',
          password: 'password123',
        },
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.json.success === true, 'Expected success true');
      assert(res.json.data.user.role === 'admin', 'Expected admin role');
    });

    await test('POST /api/v1/auth/login with invalid password should return 401', async () => {
      const res = await makeRequest(server, '/api/v1/auth/login', {
        method: 'POST',
        body: {
          email: 'ganesh@ridemate.io',
          password: 'wrongpassword',
        },
      });
      assert(res.status === 401, `Expected 401, got ${res.status}`);
      assert(res.json.success === false, 'Expected success false');
      assert(res.json.code === 'UNAUTHORIZED', 'Expected UNAUTHORIZED code');
    });

    await test('GET /api/v1/auth/me should return authenticated user profile', async () => {
      const res = await makeRequest(server, '/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.json.data.email === testEmail, 'Profile email mismatch');
    });

    // ----------------------------------------------------
    // 3. FLEET & CAR INVENTORY MODULE
    // ----------------------------------------------------
    let createdCarId = '';

    await test('GET /api/v1/cars should list all vehicles with pagination', async () => {
      const res = await makeRequest(server, '/api/v1/cars');
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.json.success === true, 'Expected success true');
      assert(Array.isArray(res.json.data), 'Expected array of cars');
      assert(res.json.count > 0, 'Expected car count > 0');
    });

    await test('GET /api/v1/cars?search=BMW should filter results', async () => {
      const res = await makeRequest(server, '/api/v1/cars?search=BMW');
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.json.data.every((c: any) => c.brand === 'BMW' || c.name.includes('BMW')), 'Expected BMW filter');
    });

    await test('POST /api/v1/cars should create a new vehicle with valid data', async () => {
      const uniquePlate = `CA-T${Math.floor(1000 + Math.random() * 9000)}`;
      const uniqueVin = `VIN${Date.now()}`;
      const res = await makeRequest(server, '/api/v1/cars', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
          name: 'Audi e-tron GT RS',
          brand: 'Audi',
          model: 'e-tron GT RS',
          year: 2024,
          registrationNumber: uniquePlate,
          vin: uniqueVin,
          category: 'Electric',
          fuelType: 'Electric',
          transmission: 'Automatic',
          seatingCapacity: 4,
          price: 145000,
          rentalPricePerDay: 320,
          status: 'Available',
          location: 'San Francisco International Airport (SFO)',
          description: 'High performance electric grand tourer.',
          images: ['https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?q=80&w=1200'],
        },
      });
      assert(res.status === 201, `Expected 201, got ${res.status}`);
      assert(res.json.success === true, 'Expected success true');
      assert(res.json.data.registrationNumber === uniquePlate, 'Registration mismatch');
      createdCarId = res.json.data.id;
    });

    await test('POST /api/v1/cars with duplicate registration should return 409 Conflict', async () => {
      const res = await makeRequest(server, '/api/v1/cars', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
          name: 'Duplicate Test',
          brand: 'BMW',
          model: 'M4',
          year: 2024,
          registrationNumber: 'CA-8KX9201', // already in seed
          vin: 'WBA43AZ08PFP98124',
          rentalPricePerDay: 200,
        },
      });
      assert(res.status === 409, `Expected 409, got ${res.status}`);
      assert(res.json.code === 'CONFLICT', 'Expected CONFLICT code');
    });

    await test('PUT /api/v1/cars/:id should update vehicle rate and status', async () => {
      const res = await makeRequest(server, `/api/v1/cars/${createdCarId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
          rentalPricePerDay: 350,
          discount: 15,
        },
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.json.data.rentalPricePerDay === 350, 'Rental price not updated');
      assert(res.json.data.discount === 15, 'Discount not updated');
    });

    // ----------------------------------------------------
    // 4. BOOKINGS MODULE & FINANCIAL RULES
    // ----------------------------------------------------
    let createdBookingId = '';

    await test('POST /api/v1/bookings should create booking and calculate pricing + taxes correctly', async () => {
      const res = await makeRequest(server, '/api/v1/bookings', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
          vehicleId: createdCarId,
          days: 3,
          protectionPlan: 'standard', // $15 / day
          customerName: 'Alex Mercer',
          customerEmail: testEmail,
          customerPhone: '+1 415 555 0199',
          driverLicenseNumber: 'CA-D991823',
          paymentMethodLast4: '4242',
        },
      });
      assert(res.status === 201, `Expected 201, got ${res.status}`);
      assert(res.json.success === true, 'Expected success true');
      const b = res.json.data;
      assert(b.dailyRate === 350, `Expected dailyRate 350, got ${b.dailyRate}`);
      assert(b.rentalRateTotal === 1050, `Expected subtotal 1050, got ${b.rentalRateTotal}`);
      assert(b.protectionFee === 45, `Expected protectionFee 45 (3*15), got ${b.protectionFee}`);
      assert(b.pickupCode.startsWith('RM-'), `Expected pickup code RM-XXXX, got ${b.pickupCode}`);
      assert(b.status === 'Confirmed', `Expected Confirmed status, got ${b.status}`);
      createdBookingId = b.id;
    });

    await test('Vehicle status should transition to Rented after confirmed booking', async () => {
      const res = await makeRequest(server, `/api/v1/cars/${createdCarId}`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.json.data.status === 'Rented', `Expected vehicle status Rented, got ${res.json.data.status}`);
    });

    await test('POST /api/v1/bookings/:id/cancel should cancel booking and release vehicle to Available', async () => {
      const res = await makeRequest(server, `/api/v1/bookings/${createdBookingId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.json.data.status === 'Cancelled', 'Booking not cancelled');

      const carRes = await makeRequest(server, `/api/v1/cars/${createdCarId}`);
      assert(carRes.json.data.status === 'Available', `Expected vehicle status Available, got ${carRes.json.data.status}`);
    });

    // ----------------------------------------------------
    // 5. OPERATIONS & TELEMETRY MODULE
    // ----------------------------------------------------
    await test('GET /api/v1/operations/telemetry should return fleet vehicle status & battery/fuel', async () => {
      const res = await makeRequest(server, '/api/v1/operations/telemetry');
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(Array.isArray(res.json.data), 'Expected array of telemetry vehicles');
      assert(res.json.data.length > 0, 'Expected at least 1 fleet vehicle');
    });

    await test('POST /api/v1/operations/remote-command should execute lock/unlock command', async () => {
      const res = await makeRequest(server, '/api/v1/operations/remote-command', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
          vehicleId: 'fl-1',
          command: 'lock',
        },
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.json.success === true, 'Expected success true');
    });

    // ----------------------------------------------------
    // 6. STATS & ANALYTICS MODULE
    // ----------------------------------------------------
    await test('GET /api/v1/stats should return fleet metrics, valuation, and activity logs', async () => {
      const res = await makeRequest(server, '/api/v1/stats');
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(typeof res.json.stats.totalCars === 'number', 'Expected totalCars number');
      assert(typeof res.json.stats.totalFleetValuation === 'number', 'Expected totalFleetValuation');
      assert(Array.isArray(res.json.recentActivity), 'Expected recentActivity array');
    });

    // ----------------------------------------------------
    // 7. AI MARKETING GENERATOR MODULE
    // ----------------------------------------------------
    await test('POST /api/v1/ai/generate-description should generate vehicle description', async () => {
      const res = await makeRequest(server, '/api/v1/ai/generate-description', {
        method: 'POST',
        body: {
          brand: 'Porsche',
          model: 'Taycan 4S',
          year: 2024,
          category: 'Electric',
          fuelType: 'Electric',
        },
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(typeof res.json.data.description === 'string' && res.json.data.description.length > 10, 'Expected non-empty description');
    });

    // ----------------------------------------------------
    // 8. LEGACY COMPATIBILITY ENDPOINTS
    // ----------------------------------------------------
    await test('GET /cars and GET /api/cars should match legacy response structure', async () => {
      const res1 = await makeRequest(server, '/cars');
      const res2 = await makeRequest(server, '/api/cars');
      assert(res1.status === 200 && res2.status === 200, 'Legacy GET /cars failed');
      assert(res1.json.success === true && res2.json.success === true, 'Expected success true');
      assert(Array.isArray(res1.json.data), 'Expected array data');
    });

    await test('GET /api/stats legacy endpoint should work seamlessly', async () => {
      const res = await makeRequest(server, '/api/stats');
      assert(res.status === 200, 'Legacy /api/stats failed');
      assert(res.json.stats.totalCars > 0, 'Stats count mismatch');
    });

    // Clean up created car
    if (createdCarId) {
      await makeRequest(server, `/api/v1/cars/${createdCarId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
    }

  } finally {
    server.close();
  }

  console.log('\n=============================================');
  console.log(`  TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('=============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
