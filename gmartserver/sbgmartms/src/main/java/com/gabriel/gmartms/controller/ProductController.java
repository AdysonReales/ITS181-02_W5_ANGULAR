package com.gabriel.gmartms.controller;

import com.gabriel.gmartms.model.Product;
import com.gabriel.gmartms.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/product")
@CrossOrigin(origins = "*")
public class ProductController {
	Logger logger = LoggerFactory.getLogger(ProductController.class);

	@Autowired
	private ProductService productService;

	// Maps directly to GET http://localhost:8080/api/product
	@GetMapping
	public ResponseEntity<?> listProduct() {
		HttpHeaders headers = new HttpHeaders();
		ResponseEntity<?> response;
		try {
			Product[] product = productService.getAll();
			response = ResponseEntity.ok().headers(headers).body(product);
		} catch (Exception ex) {
			response = ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
		}
		return response;
	}

	// Maps directly to POST http://localhost:8080/api/product
	@PostMapping
	public ResponseEntity<?> add(@RequestBody Product product) {
		logger.info("Input >> " + product.toString());
		HttpHeaders headers = new HttpHeaders();
		ResponseEntity<?> response;
		try {
			Product newProduct = productService.create(product);
			logger.info("created product >> " + newProduct.toString());
			response = ResponseEntity.ok(newProduct);
		} catch (Exception ex) {
			logger.error("Failed to retrieve product with id : {}", ex.getMessage(), ex);
			response = ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
		}
		return response;
	}

	// Maps directly to PUT http://localhost:8080/api/product
	@PutMapping
	public ResponseEntity<?> update(@RequestBody Product product) {
		logger.info("Update Input >> " + product.toString());
		HttpHeaders headers = new HttpHeaders();
		ResponseEntity<?> response;
		try {
			Product newProduct = productService.update(product);
			response = ResponseEntity.ok(product);
		} catch (Exception ex) {
			logger.error("Failed to retrieve product with id : {}", ex.getMessage(), ex);
			response = ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
		}
		return response;
	}

	// Maps directly to GET http://localhost:8080/api/product/{id}
	@GetMapping("/{id}")
	public ResponseEntity<?> get(@PathVariable final Integer id) {
		logger.info("Input product id >> " + Integer.toString(id));
		HttpHeaders headers = new HttpHeaders();
		ResponseEntity<?> response;
		try {
			Product product = productService.get(id);
			response = ResponseEntity.ok(product);
		} catch (Exception ex) {
			response = ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
		}
		return response;
	}

	// Maps directly to DELETE http://localhost:8080/api/product/{id}
	@DeleteMapping("/{id}")
	public ResponseEntity<?> delete(@PathVariable final Integer id) {
		logger.info("Input >> " + Integer.toString(id));
		HttpHeaders headers = new HttpHeaders();
		ResponseEntity<?> response;
		try {
			productService.delete(id);
			response = ResponseEntity.ok(null);
		} catch (Exception ex) {
			response = ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
		}
		return response;
	}
}