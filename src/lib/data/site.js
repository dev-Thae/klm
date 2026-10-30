/**
 * Site-wide settings: contact address, bank-transfer details for Mağaza
 * orders, and the GitHub repository the admin page (/yonetim) commits to.
 * Client-safe — everything here is public anyway; nothing secret goes here.
 */
export const CONTACT_EMAIL = 'klmyayinlari@gmail.com';

/**
 * Shown to customers after they place a Mağaza order. While `iban` is empty
 * the page tells them the payment details will be sent by e-mail instead, so
 * no placeholder account number ever appears on the live site.
 */
export const PAYMENT = {
	iban: '', // e.g. 'TR12 3456 7890 1234 5678 9012 34'
	holder: '', // account holder name, e.g. 'KLM Yayınları'
	bank: '' // e.g. 'Ziraat Bankası'
};

/** Where the admin page writes new books; a push to `branch` redeploys the site. */
export const REPO = { owner: 'dev-Thae', name: 'klm', branch: 'main' };
