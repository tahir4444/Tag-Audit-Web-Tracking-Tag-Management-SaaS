const crypto = require('crypto');

/**
 * Generate a unique verification code for website ownership verification
 * @returns {string} A unique verification code
 */
const generateVerificationCode = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Generate meta tag HTML for website verification
 * @param {string} verificationCode - The verification code to include in the meta tag
 * @returns {string} HTML meta tag
 */
const generateMetaTag = (verificationCode) => {
  return `<meta name="tag-audit-verification" content="${verificationCode}" />`;
};

/**
 * Generate file content for website verification
 * @param {string} verificationCode - The verification code to include in the file
 * @returns {string} File content
 */
const generateVerificationFile = (verificationCode) => {
  return `tag-audit-verification: ${verificationCode}`;
};

/**
 * Generate DNS record for website verification
 * @param {string} verificationCode - The verification code to include in the DNS record
 * @returns {string} DNS record value
 */
const generateDNSRecord = (verificationCode) => {
  return `tag-audit-verification=${verificationCode}`;
};

/**
 * Verify meta tag in HTML content
 * @param {string} html - The HTML content to check
 * @param {string} verificationCode - The verification code to look for
 * @returns {boolean} Whether the verification code was found
 */
const verifyMetaTag = (html, verificationCode) => {
  const metaTagRegex = new RegExp(
    `<meta[^>]*name="tag-audit-verification"[^>]*content="${verificationCode}"[^>]*>`,
    'i'
  );
  return metaTagRegex.test(html);
};

/**
 * Verify file content
 * @param {string} content - The file content to check
 * @param {string} verificationCode - The verification code to look for
 * @returns {boolean} Whether the verification code was found
 */
const verifyFile = (content, verificationCode) => {
  return content.trim() === `tag-audit-verification: ${verificationCode}`;
};

/**
 * Verify DNS record
 * @param {string} record - The DNS record to check
 * @param {string} verificationCode - The verification code to look for
 * @returns {boolean} Whether the verification code was found
 */
const verifyDNSRecord = (record, verificationCode) => {
  return record.trim() === `tag-audit-verification=${verificationCode}`;
};

module.exports = {
  generateVerificationCode,
  generateMetaTag,
  generateVerificationFile,
  generateDNSRecord,
  verifyMetaTag,
  verifyFile,
  verifyDNSRecord
}; 