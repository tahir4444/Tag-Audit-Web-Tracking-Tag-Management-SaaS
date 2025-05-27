import puppeteer from 'puppeteer';
import { load } from 'cheerio';
import axios from 'axios';

/**
 * Perform a tag audit on a website
 * @param {Object} website - The website object to audit
 * @returns {Promise<Object>} Audit results
 */
const performAudit = async (website) => {
  const issues = [];
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.goto(website.url, { waitUntil: 'networkidle0' });

    // Get page content
    const content = await page.content();
    const $ = load(content);

    // Check for GTM
    const gtmIssues = await checkGTM($, website);
    issues.push(...gtmIssues);

    // Check for GA4
    const ga4Issues = await checkGA4($, website);
    issues.push(...ga4Issues);

    // Check for Microsoft Clarity
    const clarityIssues = await checkMicrosoftClarity($, website);
    issues.push(...clarityIssues);

    // Check for duplicate tags
    const duplicateIssues = checkDuplicateTags($);
    issues.push(...duplicateIssues);

    // Check for tag placement
    const placementIssues = checkTagPlacement($);
    issues.push(...placementIssues);

    return { issues };
  } catch (error) {
    console.error('Audit error:', error);
    throw new Error('Failed to perform audit');
  } finally {
    await browser.close();
  }
};

/**
 * Check for Google Tag Manager implementation
 * @param {Object} $ - Cheerio instance
 * @param {Object} website - Website object
 * @returns {Array} Array of issues
 */
const checkGTM = async ($, website) => {
  const issues = [];
  const gtmScript = $('script').filter((i, el) => {
    return $(el).html().includes('gtm.start') || $(el).attr('src')?.includes('gtm.js');
  });

  if (gtmScript.length === 0) {
    issues.push({
      type: 'missing_tag',
      description: 'Google Tag Manager is not implemented',
      severity: 'high',
      page: website.url,
      fix: {
        status: 'pending',
        method: 'manual'
      }
    });
  } else if (gtmScript.length > 1) {
    issues.push({
      type: 'duplicate_tag',
      description: 'Multiple Google Tag Manager implementations found',
      severity: 'high',
      page: website.url,
      fix: {
        status: 'pending',
        method: 'manual'
      }
    });
  }

  return issues;
};

/**
 * Check for Google Analytics 4 implementation
 * @param {Object} $ - Cheerio instance
 * @param {Object} website - Website object
 * @returns {Array} Array of issues
 */
const checkGA4 = async ($, website) => {
  const issues = [];
  const ga4Script = $('script').filter((i, el) => {
    return $(el).html().includes('gtag') || $(el).attr('src')?.includes('gtag/js');
  });

  if (ga4Script.length === 0) {
    issues.push({
      type: 'missing_tag',
      description: 'Google Analytics 4 is not implemented',
      severity: 'high',
      page: website.url,
      fix: {
        status: 'pending',
        method: 'manual'
      }
    });
  } else if (ga4Script.length > 1) {
    issues.push({
      type: 'duplicate_tag',
      description: 'Multiple Google Analytics 4 implementations found',
      severity: 'high',
      page: website.url,
      fix: {
        status: 'pending',
        method: 'manual'
      }
    });
  }

  return issues;
};

/**
 * Check for Microsoft Clarity implementation
 * @param {Object} $ - Cheerio instance
 * @param {Object} website - Website object
 * @returns {Array} Array of issues
 */
const checkMicrosoftClarity = async ($, website) => {
  const issues = [];
  const clarityScript = $('script').filter((i, el) => {
    return $(el).html().includes('clarity') || $(el).attr('src')?.includes('clarity');
  });

  if (clarityScript.length === 0) {
    issues.push({
      type: 'missing_tag',
      description: 'Microsoft Clarity is not implemented',
      severity: 'medium',
      page: website.url,
      fix: {
        status: 'pending',
        method: 'manual'
      }
    });
  } else if (clarityScript.length > 1) {
    issues.push({
      type: 'duplicate_tag',
      description: 'Multiple Microsoft Clarity implementations found',
      severity: 'medium',
      page: website.url,
      fix: {
        status: 'pending',
        method: 'manual'
      }
    });
  }

  return issues;
};

/**
 * Check for duplicate tracking tags
 * @param {Object} $ - Cheerio instance
 * @returns {Array} Array of issues
 */
const checkDuplicateTags = ($) => {
  const issues = [];
  const scripts = $('script');
  const scriptContents = new Map();

  scripts.each((i, el) => {
    const content = $(el).html() || $(el).attr('src') || '';
    if (scriptContents.has(content)) {
      issues.push({
        type: 'duplicate_tag',
        description: 'Duplicate script found',
        severity: 'medium',
        page: window.location.href,
        fix: {
          status: 'pending',
          method: 'manual'
        }
      });
    }
    scriptContents.set(content, true);
  });

  return issues;
};

/**
 * Check for proper tag placement
 * @param {Object} $ - Cheerio instance
 * @returns {Array} Array of issues
 */
const checkTagPlacement = ($) => {
  const issues = [];
  const head = $('head');
  const body = $('body');

  // Check if tracking scripts are in the head
  const trackingScripts = $('script').filter((i, el) => {
    const content = $(el).html() || $(el).attr('src') || '';
    return content.includes('gtm') || content.includes('gtag') || content.includes('clarity');
  });

  trackingScripts.each((i, el) => {
    if (!head.find(el).length) {
      issues.push({
        type: 'misconfigured_tag',
        description: 'Tracking script should be placed in the head section',
        severity: 'medium',
        page: window.location.href,
        fix: {
          status: 'pending',
          method: 'manual'
        }
      });
    }
  });

  return issues;
};

export {
  performAudit,
  checkGTM,
  checkGA4,
  checkMicrosoftClarity,
  checkDuplicateTags,
  checkTagPlacement
}; 