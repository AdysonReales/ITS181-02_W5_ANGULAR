package com.gabriel.gmartms.model;

import lombok.Data;

@Data
public class Product {
    int id;
    String name;
    String description;
    String imageUrl;
    String uom;
    double price;
}
