/**
 * Demonstrates all required selector types against automationexercise.com.
 * Dynamic builder functions accept parameters; raw selectors never appear in steps.
 */
export const CommonLocators = {
  // --- CSS selectors ---
  logo: 'div.logo a',
  searchInput: 'input#search_product',
  searchButton: 'button#submit_search',
  cartCount: 'li a[href="/view_cart"] span',

  // --- by id ---
  loginEmail: '#email',
  loginPassword: '#password',
  registerName: '#name',

  // --- by name ---
  contactName: '[name="name"]',
  contactEmail: '[name="email"]',
  contactSubject: '[name="subject"]',
  contactMessage: '[name="message"]',
  contactUpload: '[name="upload_file"]',

  // --- by class ---
  productCard: '.single-products',
  navbarLinks: '.navbar-nav li',

  // --- XPath (relative) ---
  headerNav: `//header//nav`,
  loginFormTitle: `//div[@class='login-form']//h2`,

  // --- XPath Axes ---
  // following-sibling: next sibling of a nav item
  navItemFollowingSibling: (text: string) =>
    `//ul[@class='nav navbar-nav']//a[contains(text(),'${text}')]/parent::li/following-sibling::li[1]/a`,
  // ancestor
  productCardAncestor: (name: string) =>
    `//p[contains(text(),'${name}')]/ancestor::div[contains(@class,'single-products')]`,
  // parent
  addToCartParent: (productName: string) =>
    `//p[text()='${productName}']/parent::div/following-sibling::div//a[contains(@class,'add-to-cart')]`,
  // descendant
  featuredProducts: `//section[@id='featuredItems']//descendant::div[@class='single-products']`,
  // preceding
  productPreceding: (productName: string) =>
    `//p[text()='${productName}']/preceding-sibling::div[@class='product-image-wrapper']`,

  // --- Dynamic builders ---
  productByName: (name: string) => `//div[@class='productinfo text-center']//p[text()='${name}']`,
  gridRow: (index: number) => `table tbody tr:nth-child(${index})`,
  gridCell: (row: number, col: number) => `table tbody tr:nth-child(${row}) td:nth-child(${col})`,
  categoryLink: (category: string) => `a[href="/category_products/${category}"]`,
  brandLink: (brand: string) => `a[href="/brand_products/${brand}"]`,

  // --- Playwright role/text/testid (best practice) ---
  // Used in page objects — kept here as reference
  loginButton: { role: 'button' as const, name: 'Login' },
  signupButton: { role: 'button' as const, name: 'Signup' },
  continueButton: { role: 'button' as const, name: 'Continue' },
  placeOrderButton: { role: 'button' as const, name: 'Place Order' },
};
