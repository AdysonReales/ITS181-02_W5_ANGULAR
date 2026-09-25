package com.gabriel.gmartms.serviceimpl;

import com.gabriel.gmartms.entity.ProductData;
import com.gabriel.gmartms.model.Product;
import com.gabriel.gmartms.repository.ProductDataRepository;
import com.gabriel.gmartms.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;

@Service
public class ProductServiceImpl implements ProductService {
	Logger logger = LoggerFactory.getLogger(ProductServiceImpl.class);
	@Autowired
	ProductDataRepository productDataRepository;

	@Override
	public Product[] getAll() {
		List<ProductData> productsData = new ArrayList<>();
		List<Product> products = new ArrayList<>();
		productDataRepository.findAll().forEach(productsData::add);
		Iterator<ProductData> it = productsData.iterator();
		while(it.hasNext()) {
			ProductData productData = it.next();
			Product product = new Product();
			product.setId(productData.getId());
			product.setName(productData.getName());
      product.setDescription(productData.getDescription());
      product.setImageUrl(productData.getImageUrl());
      product.setUom(productData.getUom());
      product.setPrice(productData.getPrice());
			products.add(product);
		}
		Product[] array = new Product[products.size()];
		for  (int i=0; i<products.size(); i++){
			array[i] = products.get(i);
		}
		return array;
	}
	@Override
	public Product create(Product product) {
		logger.info(" add:Input " + product.toString());
		ProductData productData = new ProductData();
		productData.setName(product.getName());
    productData.setDescription(product.getDescription());
    productData.setImageUrl(product.getImageUrl());
    productData.setUom(product.getUom());
    productData.setPrice(product.getPrice());
		productData = productDataRepository.save(productData);
		logger.info(" add:Input " + productData.toString());
			Product newProduct = new Product();
			newProduct.setId(productData.getId());
			newProduct.setName(productData.getName());
      newProduct.setDescription(productData.getDescription());
      newProduct.setImageUrl(product.getImageUrl());
      newProduct.setUom(productData.getUom());
      newProduct.setPrice(productData.getPrice());
		return newProduct;
	}
	@Override
	public Product update(Product product) {
		ProductData productData = new ProductData();
		productData.setId(product.getId());
		productData.setName(product.getName());
    productData.setDescription(product.getDescription());
    productData.setImageUrl(product.getImageUrl());
    productData.setUom(product.getUom());
    productData.setPrice(product.getPrice());

		productData = productDataRepository.save(productData);
		Product newProduct = new Product();
		newProduct.setId(productData.getId());
		newProduct.setName(productData.getName());
    newProduct.setDescription(productData.getDescription());
    newProduct.setUom(productData.getUom());
    newProduct.setImageUrl(productData.getImageUrl());
    newProduct.setPrice(productData.getPrice());
		return newProduct;
	}
	@Override
	public Product get(Integer id) {
		logger.info(" Input id >> "+  Integer.toString(id) );
		Optional<ProductData> optional = productDataRepository.findById(id);
		if(optional.isPresent()) {
			logger.info(" Is present >> ");
			ProductData productData = optional.get();
			Product product = new Product();
			product.setId(productData.getId());
			product.setName(productData.getName());
      product.setDescription(productData.getDescription());
      product.setImageUrl(productData.getImageUrl());
      product.setUom(productData.getUom());
      product.setPrice(productData.getPrice());
			return product;
		}
		logger.info(" Failed >> unable to locate id: " +  Integer.toString(id)  );
		return null;
	}
	@Override
	public void delete(Integer id) {
		logger.info(" Input >> " +  Integer.toString(id));
		Optional<ProductData> optional = productDataRepository.findById(id);
		if( optional.isPresent()) {
			ProductData productDatum = optional.get();
			productDataRepository.delete(productDatum);
			logger.info(" Success >> " + productDatum.toString());
		}
		else {
			logger.info(" Failed >> unable to locateproduct id:" +  Integer.toString(id));
		}
	}
}
