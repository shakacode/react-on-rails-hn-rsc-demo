require "application_system_test_case"

class PageLoadsTest < ApplicationSystemTestCase
  test "root page loads through the RSC app" do
    visit root_path

    assert_text "Hacker Next on Rails"
    assert_text "Rails + React on Rails RSC"
  end
end
