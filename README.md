# GMart Application

## Angular & Spring Boot Full-Stack Integration

GMart is a full-stack web application that integrates an **Angular frontend** with a **Spring Boot REST API backend** and a **MySQL database**.

The project demonstrates full-stack CRUD operations, REST API integration, database persistence using JPA/Hibernate, Spring Security configuration, CORS handling, and dynamic frontend data rendering.

---

## Tech Stack

### Frontend

* Angular 18+
* TypeScript
* HTML5
* CSS3
* RxJS
* Angular HttpClient

### Backend

* Java 17
* Spring Boot 3.x
* Spring Data JPA
* Hibernate
* Spring Security
* Apache Tomcat
* Maven

### Database

* MySQL

### Development Tools

* Git
* GitHub
* Visual Studio Code / IntelliJ IDEA / Eclipse
* Angular CLI

---

## Project Structure

```text
GMart/
│
├── gmart/
│   ├── src/
│   │   └── app/
│   │       ├── modal/
│   │       │   └── product.ts
│   │       ├── services/
│   │       │   └── product.service.ts
│   │       └── components/
│   │           └── products/
│   │               ├── products.component.html
│   │               ├── products.component.css
│   │               └── products.component.ts
│   │
│   ├── package.json
│   └── angular.json
│
├── gmartserver/
│   └── sbgmartms/
│       ├── src/
│       │   └── main/
│       │       ├── java/
│       │       │   └── com/
│       │       │       └── gabriel/
│       │       │           └── gmartms/
│       │       │               ├── controller/
│       │       │               ├── model/
│       │       │               │   └── ProductData.java
│       │       │               ├── repository/
│       │       │               ├── service/
│       │       │               └── config/
│       │       │                   └── SecurityConfig.java
│       │       └── resources/
│       │
│       └── pom.xml
│
└── README.md
```

---

# Key Features

## 1. Spring Boot REST API

The backend provides RESTful API endpoints for managing product inventory.

### Product Endpoint

```text
/api/product
```

The API supports CRUD operations for product data.

| Method | Endpoint            | Description       |
| ------ | ------------------- | ----------------- |
| GET    | `/api/product`      | Retrieve products |
| POST   | `/api/product`      | Create a product  |
| PUT    | `/api/product/{id}` | Update a product  |
| DELETE | `/api/product/{id}` | Delete a product  |

The backend uses **Spring Data JPA and Hibernate** to communicate with the MySQL database.

---

## 2. Product Entity

Products are represented by the `ProductData` Java entity.

```java
package com.gabriel.gmartms.model;

import javax.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "Product_data")
public class ProductData {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private String name;
    private String description;
    private String imageUrl;
    private String uom;
    private Double price;
}
```

The entity is mapped to the following database table:

```text
Product_data
```

---

## 3. Angular Web Client

The Angular frontend communicates with the Spring Boot backend using `HttpClient`.

A dedicated `ProductService` handles API requests and provides product data to Angular components.

The product catalog dynamically renders API results using Angular templates and `*ngFor`.

Example:

```html
<div *ngFor="let product of products">
    <!-- Product Card -->
</div>
```

The frontend displays product information such as:

* Product name
* Description
* Image
* Unit of measurement
* Price

---

## 4. Angular Product Model

The Angular product model is aligned with the backend `ProductData` entity.

```typescript
export class Product {
  id!: number;
  name!: string;
  description!: string;
  imageUrl!: string;
  uom!: string;
  price!: number;
}
```

This allows the Angular application to properly consume the JSON data returned by the Spring Boot API.

---

# Architecture

GMart follows a basic full-stack architecture:

```text
┌──────────────────────────────┐
│       Angular Frontend       │
│          gmart               │
│                              │
│  Components                  │
│  ProductService              │
│  Product Model               │
└──────────────┬───────────────┘
               │
               │ HTTP / REST API
               ▼
┌──────────────────────────────┐
│      Spring Boot Backend     │
│        gmartserver            │
│                              │
│  REST Controllers             │
│  Services                     │
│  JPA Repositories             │
│  ProductData Entity           │
│  Spring Security              │
└──────────────┬───────────────┘
               │
               │ JPA / Hibernate
               ▼
┌──────────────────────────────┐
│          MySQL               │
│                              │
│       Product_data           │
└──────────────────────────────┘
```

---

# CORS & Security

The Spring Boot backend is configured to accept requests from the Angular development server.

Angular development server:

```text
http://localhost:4200
```

Backend server:

```text
http://localhost:8080
```

Spring Security was configured using the Spring Security 6.x lambda-based configuration syntax.

Development configuration includes:

* CORS configuration
* Cross-origin requests from Angular
* CSRF disabled for REST API development
* API request authorization configuration

---

# Issues Resolved

During development, several integration issues were encountered and resolved.

### Connection Refused / Network Error

The backend host binding and server port were verified to ensure that the Angular application could communicate with the Spring Boot server.

Backend:

```text
localhost:8080
```

---

### 404 Endpoint Not Found

The product controller contained an endpoint mapping issue caused by duplicated URL paths.

The controller mapping was corrected so that:

```text
/api/product
```

is used consistently without unintentionally duplicating the path.

---

### CORS & Security Restrictions

Spring Security was updated to use the Spring Security 6.x lambda configuration syntax.

CORS was enabled to allow the Angular development server to communicate with the backend.

---

### UI Data Rendering

Angular product cards and CSS grid rules were implemented to properly display the product array retrieved from the REST API.

---

### Git Repository Consolidation

The frontend and backend were originally maintained with nested Git repositories.

The nested `.git` directories were removed and the projects were consolidated into a single root Git repository.

Final structure:

```text
GMart/
├── gmart/
├── gmartserver/
└── README.md
```

---

# Getting Started

## Prerequisites

Make sure the following software is installed:

* **Java JDK 17+**
* **Node.js**
* **npm**
* **Angular CLI**
* **Maven**
* **MySQL Server**
* **Git**

Install Angular CLI globally if it is not already installed:

```bash
npm install -g @angular/cli
```

---

# Database Setup

Create a MySQL database for the application.

Example:

```sql
CREATE DATABASE gmart;
```

Configure the database connection in the Spring Boot application's configuration file.

Typical configuration:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/gmart
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

> Update the username, password, database name, and other connection properties according to your local MySQL setup.

---

# Running the Backend

Navigate to the Spring Boot project:

```bash
cd gmartserver/sbgmartms
```

Start the application using Maven:

```bash
mvn spring-boot:run
```

The backend will be available at:

```text
http://localhost:8080
```

Product API:

```text
http://localhost:8080/api/product
```

---

# Running the Frontend

Open another terminal and navigate to the Angular project:

```bash
cd gmart
```

Install the dependencies:

```bash
npm install
```

Start the Angular development server:

```bash
ng serve
```

Open the application in your browser:

```text
http://localhost:4200
```

---

# Development Workflow

The typical development workflow is:

```text
1. Start MySQL
       ↓
2. Start Spring Boot Backend
       ↓
3. Start Angular Frontend
       ↓
4. Angular requests product data
       ↓
5. Spring Boot REST API processes request
       ↓
6. JPA/Hibernate communicates with MySQL
       ↓
7. API returns JSON
       ↓
8. Angular renders products
```

---

# API Example

### Get Products

```http
GET /api/product
```

Example response:

```json
[
  {
    "id": 1,
    "name": "Sample Product",
    "description": "Example product description",
    "imageUrl": "https://example.com/product.jpg",
    "uom": "pcs",
    "price": 99.99
  }
]
```

---

# Project Goals

The GMart application demonstrates the integration of modern web development technologies into a single full-stack application.

The primary goals are to demonstrate:

* Angular frontend development
* Spring Boot REST API development
* CRUD operations
* MySQL database integration
* JPA/Hibernate ORM
* RESTful communication
* Spring Security configuration
* CORS configuration
* TypeScript and Java model alignment
* Git repository management
* Full-stack application deployment architecture

---

# Future Improvements

Potential future enhancements include:

* User authentication and registration
* Shopping cart functionality
* Order management
* Product search and filtering
* Product categories
* Pagination
* Admin dashboard
* Product image management
* Checkout system
* Order history
* Improved validation and error handling
* Production deployment

---

# License

This project is intended for educational and development purposes.
