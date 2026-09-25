package com.gabriel.gmartms.controller;

import com.gabriel.gmartms.model.Status;
import com.gabriel.gmartms.service.StatusService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/status")
@CrossOrigin(origins = "*")
public class StatusController {
	Logger logger = LoggerFactory.getLogger(StatusController.class);

	@Autowired
	private StatusService statusService;

	@GetMapping
	public ResponseEntity<?> listStatus() {
		HttpHeaders headers = new HttpHeaders();
		ResponseEntity<?> response;
		try {
			Status[] status = statusService.getAll();
			response = ResponseEntity.ok().headers(headers).body(status);
		} catch (Exception ex) {
			response = ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
		}
		return response;
	}

	@PostMapping
	public ResponseEntity<?> add(@RequestBody Status status) {
		logger.info("Input >> " + status.toString());
		HttpHeaders headers = new HttpHeaders();
		ResponseEntity<?> response;
		try {
			Status newStatus = statusService.create(status);
			logger.info("created status >> " + newStatus.toString());
			response = ResponseEntity.ok(newStatus);
		} catch (Exception ex) {
			logger.error("Failed to retrieve status with id : {}", ex.getMessage(), ex);
			response = ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
		}
		return response;
	}

	@PutMapping
	public ResponseEntity<?> update(@RequestBody Status status) {
		logger.info("Update Input >> status.toString()");
		HttpHeaders headers = new HttpHeaders();
		ResponseEntity<?> response;
		try {
			Status newStatus = statusService.update(status);
			response = ResponseEntity.ok(status);
		} catch (Exception ex) {
			logger.error("Failed to retrieve status with id : {}", ex.getMessage(), ex);
			response = ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
		}
		return response;
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> get(@PathVariable final Integer id) {
		logger.info("Input status id >> " + Integer.toString(id));
		HttpHeaders headers = new HttpHeaders();
		ResponseEntity<?> response;
		try {
			Status status = statusService.get(id);
			response = ResponseEntity.ok(status);
		} catch (Exception ex) {
			response = ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
		}
		return response;
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<?> delete(@PathVariable final Integer id) {
		logger.info("Input >> " + Integer.toString(id));
		HttpHeaders headers = new HttpHeaders();
		ResponseEntity<?> response;
		try {
			statusService.delete(id);
			response = ResponseEntity.ok(null);
		} catch (Exception ex) {
			response = ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
		}
		return response;
	}
}