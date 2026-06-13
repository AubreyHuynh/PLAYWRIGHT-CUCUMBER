@ui @regression
Feature: Shopping Cart

  Background:
    Given I am logged in as a new user

  Scenario: Add product to cart and verify
    Given I am on the products page
    When I add "Blue Top" to cart
    And I am on the cart page
    Then the cart should contain "Blue Top"
    And the cart should have 1 item(s)

  Scenario: Remove product from cart
    Given I am on the products page
    When I add the first available product to cart
    And I am on the cart page
    When I remove the first item from cart
    Then the cart should be empty
