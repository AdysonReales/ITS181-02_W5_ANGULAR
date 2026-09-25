package com.gabriel.gmartms.transform;
import com.gabriel.gmartms.entity.ProductData;
import com.gabriel.gmartms.model.Product;
import org.springframework.stereotype.Service;
@Service
public class TransformProductServiceImpl implements TransformProductService {
	@Override
	public ProductData transform(Product product){
		ProductData productData = new ProductData();
		productData.setId(product.getId());
		return productData;
	}
	@Override

	public Product transform(ProductData productData){;
		Product product = new Product();
		product.setId(productData.getId());
		return product;
	}
}
