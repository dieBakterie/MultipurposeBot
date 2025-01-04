// src/utils/apiManager.js
import axios from "axios";
import { handleAxiosError } from "./helpers.js";

export default class APIManager {
  /**
   * Erstellt eine Instanz von APIManager.
   * @param {string} baseURL - Die Basis-URL der API.
   * @param {object} [defaultHeaders={}] - Standard-Header für alle Anfragen.
   */
  constructor(baseURL, defaultHeaders = {}) {
    this.client = axios.create({
      baseURL,
      headers: defaultHeaders,
    });
  }

  /**
   * Führt eine HTTP-Anfrage aus.
   * @param {string} endpoint - Der Endpunkt der API.
   * @param {string} [method="GET"] - Die HTTP-Methode (z. B. GET, POST, PUT, DELETE).
   * @param {object} [params={}] - Query-Parameter für die Anfrage.
   * @param {object} [body=null] - Der Anfrage-Body für Methoden wie POST oder PUT.
   * @param {object} [headers={}] - Zusätzliche Header für die Anfrage.
   * @returns {Promise<any>} - Die Antwortdaten der API.
   */
  async makeRequest(
    endpoint,
    method = "GET",
    params = {},
    body = null,
    headers = {}
  ) {
    try {
      const response = await this.client.request({
        url: endpoint,
        method,
        params,
        data: body,
        headers,
      });
      return response.data; // Rückgabe der API-Daten
    } catch (error) {
      // Fehlerbehandlung
      handleAxiosError(error);
    }
  }

  /**
   * Setzt Standard-Header für alle zukünftigen Anfragen.
   * @param {object} headers - Die Standard-Header, die hinzugefügt werden sollen.
   */
  setDefaultHeaders(headers) {
    Object.assign(this.client.defaults.headers.common, headers);
  }

  /**
   * Retrieves or generates a cached access token for OAuth2 services.
   * If a valid token exists, it returns the cached token.
   * Otherwise, it requests a new token and caches it.
   * @param {string} clientId - The client ID for the service.
   * @param {string} clientSecret - The client secret for the service.
   * @param {string} tokenUrl - The URL to request the token from.
   * @param {string} grantType - The grant type for the OAuth2 request (default: "client_credentials").
   * @returns {Promise<string>} - The access token.
   */
  async getOrCacheAccessToken(clientId, clientSecret, tokenUrl, grantType = "client_credentials") {
    const now = Date.now();

    // Check if a valid token exists
    if (this.accessToken && now < this.tokenExpiresAt) {
      return this.accessToken;
    }

    try {
      const response = await this.makeRequest(tokenUrl, "POST", undefined, {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: grantType,
      }, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      const { access_token, expires_in } = response;

      // Cache the token and set its expiration time
      this.accessToken = access_token;
      this.tokenExpiresAt = now + expires_in * 1000;

      return this.accessToken;
    } catch (error) {
      handleAxiosError(error);
    }
  }
}
