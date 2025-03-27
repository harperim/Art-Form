package com.ssafy.artformuser;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class ArtformUserApplication {

	public static void main(String[] args) {
		SpringApplication.run(ArtformUserApplication.class, args);
	}

}
