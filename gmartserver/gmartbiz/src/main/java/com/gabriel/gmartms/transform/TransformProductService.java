package com.gabriel.gmartms.transform;
import com.gabriel.gmartms.entity.ProductData;
import com.gabriel.gmartms.model.Product;
public interface TransformProductService {
	ProductData transform(Product employee);
	Product transform(ProductData employeeData);
}
