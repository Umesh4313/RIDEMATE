package io.ridemate.carrental;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "io.ridemate.carrental.repository")
@EnableMongoRepositories(basePackages = "io.ridemate.carrental.mongodb.repository")
public class CarRentalApplication {
    public static void main(String[] args) {
        SpringApplication.run(CarRentalApplication.class, args);
    }
}
