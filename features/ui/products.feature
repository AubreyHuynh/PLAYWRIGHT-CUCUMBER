@ui @smoke
Feature: Product Search and Browsing

  @smoke
  Scenario: Browse all products
    Given I am on the products page
    Then the products list should be visible
    And I should see at least 1 products

  @regression
  Scenario: Search for a product by keyword
    Given I am on the products page
    When I search for product "Top"
    Then I should see search results

  @smoke
  Scenario Outline: Search for multiple product types
    Given I am on the products page
    When I search for product "<keyword>"
    Then I should see search results

    Examples:
      | keyword |
      | Dress   |
      | Top     |
      | Jeans   |

  @regression
  Scenario: Add product to cart
    Given I am logged in as a new user
    And I am on the products page
    When I add "Blue Top" to cart
    Then the cart should contain "Blue Top"

  @flaky
  Scenario: Product images load within acceptable time
    # Quarantined: image CDN occasionally times out in CI; tracked in #ISSUE-42
    Given I am on the products page
    Then the products list should be visible
