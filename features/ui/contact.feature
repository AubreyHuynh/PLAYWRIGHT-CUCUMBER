@ui @smoke
Feature: Contact Us Form with File Upload

  Scenario: Submit contact form with file attachment
    Given I am on the contact page
    When I fill the contact form with valid data
    And I upload "sample.txt" as attachment
    And I submit the contact form
    Then I should see a contact success message

  @smoke @dynamic
  Scenario: Submit contact form with dynamic sender identity
    Given I am on the contact page
    When I fill the contact form with name "{{unique_username}}" and email "{{unique_email}}"
    And I submit the contact form
    Then I should see a contact success message
