import axios from 'axios';

class CMSService {
  constructor() {
    this.shopify = {
      apiVersion: '2024-01',
      endpoints: {
        scriptTags: '/admin/api/2024-01/script_tags.json',
        metafields: '/admin/api/2024-01/metafields.json'
      }
    };

    this.woocommerce = {
      endpoints: {
        settings: '/wp-json/wc/v3/settings',
        scripts: '/wp-json/wp/v2/scripts'
      }
    };

    this.wordpress = {
      endpoints: {
        options: '/wp-json/wp/v2/options',
        scripts: '/wp-json/wp/v2/scripts'
      }
    };

    this.magento = {
      endpoints: {
        config: '/rest/V1/config',
        scripts: '/rest/V1/scripts'
      }
    };
  }

  /**
   * Add GTM script to Shopify store
   * @param {string} shopDomain - Shopify store domain
   * @param {string} accessToken - Shopify access token
   * @param {string} gtmId - GTM container ID
   * @returns {Promise<Object>} Created script tag
   */
  async addGTMToShopify(shopDomain, accessToken, gtmId) {
    try {
      const response = await axios.post(
        `https://${shopDomain}${this.shopify.endpoints.scriptTags}`,
        {
          script_tag: {
            event: 'onload',
            src: `https://www.googletagmanager.com/gtm.js?id=${gtmId}`,
            display_scope: 'online_store'
          }
        },
        {
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.script_tag;
    } catch (error) {
      console.error('Error adding GTM to Shopify:', error);
      throw new Error('Failed to add GTM to Shopify store');
    }
  }

  /**
   * Add GTM script to WooCommerce site
   * @param {string} siteUrl - WooCommerce site URL
   * @param {string} consumerKey - WooCommerce consumer key
   * @param {string} consumerSecret - WooCommerce consumer secret
   * @param {string} gtmId - GTM container ID
   * @returns {Promise<Object>} Created script
   */
  async addGTMToWooCommerce(siteUrl, consumerKey, consumerSecret, gtmId) {
    try {
      const response = await axios.post(
        `${siteUrl}${this.woocommerce.endpoints.scripts}`,
        {
          title: 'Google Tag Manager',
          src: `https://www.googletagmanager.com/gtm.js?id=${gtmId}`,
          position: 'header'
        },
        {
          auth: {
            username: consumerKey,
            password: consumerSecret
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding GTM to WooCommerce:', error);
      throw new Error('Failed to add GTM to WooCommerce site');
    }
  }

  /**
   * Add GTM script to WordPress site
   * @param {string} siteUrl - WordPress site URL
   * @param {string} username - WordPress username
   * @param {string} password - WordPress password
   * @param {string} gtmId - GTM container ID
   * @returns {Promise<Object>} Created script
   */
  async addGTMToWordPress(siteUrl, username, password, gtmId) {
    try {
      const response = await axios.post(
        `${siteUrl}${this.wordpress.endpoints.scripts}`,
        {
          title: 'Google Tag Manager',
          src: `https://www.googletagmanager.com/gtm.js?id=${gtmId}`,
          position: 'header'
        },
        {
          auth: {
            username,
            password
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding GTM to WordPress:', error);
      throw new Error('Failed to add GTM to WordPress site');
    }
  }

  /**
   * Add GTM script to Magento store
   * @param {string} storeUrl - Magento store URL
   * @param {string} accessToken - Magento access token
   * @param {string} gtmId - GTM container ID
   * @returns {Promise<Object>} Created script
   */
  async addGTMToMagento(storeUrl, accessToken, gtmId) {
    try {
      const response = await axios.post(
        `${storeUrl}${this.magento.endpoints.scripts}`,
        {
          name: 'Google Tag Manager',
          src: `https://www.googletagmanager.com/gtm.js?id=${gtmId}`,
          position: 'header'
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding GTM to Magento:', error);
      throw new Error('Failed to add GTM to Magento store');
    }
  }

  /**
   * Remove GTM script from Shopify store
   * @param {string} shopDomain - Shopify store domain
   * @param {string} accessToken - Shopify access token
   * @param {string} scriptTagId - Script tag ID
   * @returns {Promise<void>}
   */
  async removeGTMFromShopify(shopDomain, accessToken, scriptTagId) {
    try {
      await axios.delete(
        `https://${shopDomain}/admin/api/2024-01/script_tags/${scriptTagId}.json`,
        {
          headers: {
            'X-Shopify-Access-Token': accessToken
          }
        }
      );
    } catch (error) {
      console.error('Error removing GTM from Shopify:', error);
      throw new Error('Failed to remove GTM from Shopify store');
    }
  }

  /**
   * Remove GTM script from WooCommerce site
   * @param {string} siteUrl - WooCommerce site URL
   * @param {string} consumerKey - WooCommerce consumer key
   * @param {string} consumerSecret - WooCommerce consumer secret
   * @param {string} scriptId - Script ID
   * @returns {Promise<void>}
   */
  async removeGTMFromWooCommerce(siteUrl, consumerKey, consumerSecret, scriptId) {
    try {
      await axios.delete(
        `${siteUrl}${this.woocommerce.endpoints.scripts}/${scriptId}`,
        {
          auth: {
            username: consumerKey,
            password: consumerSecret
          }
        }
      );
    } catch (error) {
      console.error('Error removing GTM from WooCommerce:', error);
      throw new Error('Failed to remove GTM from WooCommerce site');
    }
  }

  /**
   * Remove GTM script from WordPress site
   * @param {string} siteUrl - WordPress site URL
   * @param {string} username - WordPress username
   * @param {string} password - WordPress password
   * @param {string} scriptId - Script ID
   * @returns {Promise<void>}
   */
  async removeGTMFromWordPress(siteUrl, username, password, scriptId) {
    try {
      await axios.delete(
        `${siteUrl}${this.wordpress.endpoints.scripts}/${scriptId}`,
        {
          auth: {
            username,
            password
          }
        }
      );
    } catch (error) {
      console.error('Error removing GTM from WordPress:', error);
      throw new Error('Failed to remove GTM from WordPress site');
    }
  }

  /**
   * Remove GTM script from Magento store
   * @param {string} storeUrl - Magento store URL
   * @param {string} accessToken - Magento access token
   * @param {string} scriptId - Script ID
   * @returns {Promise<void>}
   */
  async removeGTMFromMagento(storeUrl, accessToken, scriptId) {
    try {
      await axios.delete(
        `${storeUrl}${this.magento.endpoints.scripts}/${scriptId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
    } catch (error) {
      console.error('Error removing GTM from Magento:', error);
      throw new Error('Failed to remove GTM from Magento store');
    }
  }
}

export default new CMSService(); 