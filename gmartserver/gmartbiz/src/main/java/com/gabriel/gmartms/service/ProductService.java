package com.gabriel.gmartms.service;
import com.gabriel.gmartms.model.Product;

public interface ProductService {
	Product[] getAll() throws Exception;
	Product get(Integer id) throws Exception;
	Product create(Product product) throws Exception;
	Product update(Product product) throws Exception;
	void delete(Integer id) throws Exception;
}
