const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

class GTMService {
  constructor() {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Set credentials for GTM API
   * @param {Object} tokens - OAuth2 tokens
   */
  setCredentials(tokens) {
    this.oauth2Client.setCredentials(tokens);
  }

  /**
   * Get GTM container details
   * @param {string} accountId - GTM account ID
   * @param {string} containerId - GTM container ID
   * @returns {Promise<Object>} Container details
   */
  async getContainer(accountId, containerId) {
    try {
      const tagmanager = google.tagmanager({ version: 'v2', auth: this.oauth2Client });
      const response = await tagmanager.accounts.containers.get({
        path: `accounts/${accountId}/containers/${containerId}`
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching GTM container:', error);
      throw new Error('Failed to fetch GTM container');
    }
  }

  /**
   * List all tags in a container
   * @param {string} accountId - GTM account ID
   * @param {string} containerId - GTM container ID
   * @returns {Promise<Array>} List of tags
   */
  async listTags(accountId, containerId) {
    try {
      const tagmanager = google.tagmanager({ version: 'v2', auth: this.oauth2Client });
      const response = await tagmanager.accounts.containers.tags.list({
        parent: `accounts/${accountId}/containers/${containerId}`
      });
      return response.data.tag || [];
    } catch (error) {
      console.error('Error listing GTM tags:', error);
      throw new Error('Failed to list GTM tags');
    }
  }

  /**
   * Create a new tag in GTM
   * @param {string} accountId - GTM account ID
   * @param {string} containerId - GTM container ID
   * @param {Object} tag - Tag configuration
   * @returns {Promise<Object>} Created tag
   */
  async createTag(accountId, containerId, tag) {
    try {
      const tagmanager = google.tagmanager({ version: 'v2', auth: this.oauth2Client });
      const response = await tagmanager.accounts.containers.tags.create({
        parent: `accounts/${accountId}/containers/${containerId}`,
        requestBody: tag
      });
      return response.data;
    } catch (error) {
      console.error('Error creating GTM tag:', error);
      throw new Error('Failed to create GTM tag');
    }
  }

  /**
   * Update an existing tag in GTM
   * @param {string} accountId - GTM account ID
   * @param {string} containerId - GTM container ID
   * @param {string} tagId - Tag ID
   * @param {Object} tag - Updated tag configuration
   * @returns {Promise<Object>} Updated tag
   */
  async updateTag(accountId, containerId, tagId, tag) {
    try {
      const tagmanager = google.tagmanager({ version: 'v2', auth: this.oauth2Client });
      const response = await tagmanager.accounts.containers.tags.update({
        path: `accounts/${accountId}/containers/${containerId}/tags/${tagId}`,
        requestBody: tag
      });
      return response.data;
    } catch (error) {
      console.error('Error updating GTM tag:', error);
      throw new Error('Failed to update GTM tag');
    }
  }

  /**
   * Delete a tag from GTM
   * @param {string} accountId - GTM account ID
   * @param {string} containerId - GTM container ID
   * @param {string} tagId - Tag ID
   * @returns {Promise<void>}
   */
  async deleteTag(accountId, containerId, tagId) {
    try {
      const tagmanager = google.tagmanager({ version: 'v2', auth: this.oauth2Client });
      await tagmanager.accounts.containers.tags.delete({
        path: `accounts/${accountId}/containers/${containerId}/tags/${tagId}`
      });
    } catch (error) {
      console.error('Error deleting GTM tag:', error);
      throw new Error('Failed to delete GTM tag');
    }
  }

  /**
   * Create a workspace in GTM
   * @param {string} accountId - GTM account ID
   * @param {string} containerId - GTM container ID
   * @param {string} name - Workspace name
   * @returns {Promise<Object>} Created workspace
   */
  async createWorkspace(accountId, containerId, name) {
    try {
      const tagmanager = google.tagmanager({ version: 'v2', auth: this.oauth2Client });
      const response = await tagmanager.accounts.containers.workspaces.create({
        parent: `accounts/${accountId}/containers/${containerId}`,
        requestBody: { name }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating GTM workspace:', error);
      throw new Error('Failed to create GTM workspace');
    }
  }

  /**
   * Create a version in GTM
   * @param {string} accountId - GTM account ID
   * @param {string} containerId - GTM container ID
   * @param {string} workspaceId - Workspace ID
   * @returns {Promise<Object>} Created version
   */
  async createVersion(accountId, containerId, workspaceId) {
    try {
      const tagmanager = google.tagmanager({ version: 'v2', auth: this.oauth2Client });
      const response = await tagmanager.accounts.containers.workspaces.create_version({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`
      });
      return response.data;
    } catch (error) {
      console.error('Error creating GTM version:', error);
      throw new Error('Failed to create GTM version');
    }
  }
}

module.exports = new GTMService(); 