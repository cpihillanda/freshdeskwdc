import { Fetcher, FetchUtils } from '@tableau/taco-toolkit/handlers'

export default class FreshdeskFetcher extends Fetcher {
  async *fetch({ handlerInput }) {
    const data = handlerInput.data
    yield await FetchUtils.fetchJson(data.url, {
      headers: data.headers
    })
  }
}
