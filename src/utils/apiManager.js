// src/utils/apiManager.js
import axios from "axios";

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
      const errorMessage = error.response
        ? `API Fehler: ${error.response.statusText} (${error.response.status})`
        : `Netzwerkfehler: ${error.message}`;
      throw new Error(errorMessage);
    }
  }

  /**
   * Setzt Standard-Header für alle zukünftigen Anfragen.
   * @param {object} headers - Die Standard-Header, die hinzugefügt werden sollen.
   */
  setDefaultHeaders(headers) {
    Object.assign(this.client.defaults.headers.common, headers);
  }
}
