# Spec: Product Stock Module

## ADDED Requirements

### Requirement: Product data model
The system SHALL persist products in PostgreSQL with the following fields: a unique `code`,
`name`, `quantity` (integer, ≥ 0), optional `imagePath`, optional `description`, `costPrice`
(decimal, ≥ 0), optional `markupPercentage` (decimal, ≥ 0), `salePrice` (decimal, ≥ 0),
`category` (one of: cosmetics, nails, makeup, tools), `isActive` (boolean, default true),
`createdAt`, and `updatedAt` timestamps.

#### Scenario: Unique product code
- **WHEN** a product is loaded with a `code` that already exists
- **THEN** the operation is rejected with a validation error naming the duplicate code
- **AND** no second product is persisted

#### Scenario: Non-negative numeric fields
- **WHEN** a product is submitted with a negative `quantity`, `costPrice`, or `salePrice`
- **THEN** the operation is rejected with a field-level validation error

### Requirement: Load a product (create)
The system SHALL let the user load a new product through a form opened by a prominent green
"Cargar producto" action. The form SHALL capture code, name, quantity, image, description,
cost price, category, and pricing.

#### Scenario: Load with markup percentage
- **GIVEN** the user chose the percentage pricing mode and entered cost price `1000` and
  markup `50`
- **WHEN** the product is saved
- **THEN** `markupPercentage` is stored as `50` and `salePrice` is computed and stored as
  `1500`

#### Scenario: Load with direct sale price
- **GIVEN** the user chose the direct-price mode and entered sale price `1500`
- **WHEN** the product is saved
- **THEN** `salePrice` is stored as `1500` and `markupPercentage` is null

#### Scenario: Exactly one pricing mode
- **WHEN** neither a markup percentage nor a direct sale price is provided
- **THEN** the operation is rejected asking the user to choose one pricing mode

### Requirement: Pricing calculation
The system SHALL compute sale price from cost price and markup when the percentage mode is
used: `salePrice = round(costPrice * (1 + markupPercentage / 100), 2)`.

#### Scenario: Recompute on edit
- **GIVEN** a product saved with percentage mode
- **WHEN** the user edits its cost price or markup
- **THEN** `salePrice` is recomputed and stored on save

### Requirement: Browse products as e-commerce cards
The system SHALL display products in a responsive grid of cards. Each card SHALL show the
product image, name, code, stock quantity, and sale price formatted in es-AR currency
(e.g. `$ 1.500,00`). The grid SHALL be paginated (24 per page) and images SHALL load lazily.

#### Scenario: Currency formatting
- **GIVEN** a product with `salePrice` = `1500`
- **THEN** the card renders the price as `$ 1.500,00`

#### Scenario: Active filter
- **GIVEN** the grid is showing the default view
- **WHEN** a product has `isActive = false`
- **THEN** it is excluded from the default view and visible only when the user opts to show
  inactive products

#### Scenario: Lazy image loading
- **WHEN** the products page first renders
- **THEN** only images within or near the viewport are requested; off-screen card images are
  deferred until scrolled into view

### Requirement: Edit a product
The system SHALL let the user edit an existing product via a small edit control on each card.
Editable fields SHALL include name, description, price (cost/markup/sale), quantity, category,
and image.

#### Scenario: Edit persists
- **GIVEN** an existing product
- **WHEN** the user changes its name and description and saves
- **THEN** the updated values are persisted and reflected on the card

### Requirement: Activate / deactivate a product (no delete)
The system SHALL NOT support hard-deleting products. Instead it SHALL let the user toggle a
product's `isActive` status.

#### Scenario: Deactivate
- **GIVEN** an active product
- **WHEN** the user toggles it inactive
- **THEN** `isActive` becomes false and the product is hidden from the default grid but
  retained in the database

### Requirement: Image upload and optimization
The system SHALL accept an uploaded image, compress and resize it (max ~800px wide) before
storing it under `public/uploads/`, and persist only the resulting file path. A pasted image
URL SHALL be accepted as an alternative.

#### Scenario: Oversized upload is downscaled
- **WHEN** the user uploads an image wider than 800px
- **THEN** the stored file is resized to a max width of ~800px and re-encoded to a
  web-optimized format

#### Scenario: Missing image
- **WHEN** a product has no image
- **THEN** the card renders a neutral placeholder without breaking the layout
