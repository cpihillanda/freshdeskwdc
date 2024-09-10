import Connector from '@tableau/taco-toolkit'

function onInitialized() {
  const elem = document.getElementById('submitButton')
  elem.innerText = 'Get Freshdesk Data!'
  elem.removeAttribute('disabled')
}

const connector = new Connector(onInitialized)

function submit() {
  connector.handlerInputs = [
    {
      fetcher: 'FreshdeskFetcher',
      parser: 'FreshdeskParser',
      data: {
        url: 'https://altria.freshdesk.com/api/v2/tickets',
        headers: {
          'Authorization': 'Basic ' + btoa('YOUR_API_KEY:X')
        }
      }
    }
  ]
  connector.submit()
}

window.addEventListener('load', function () {
  document.getElementById('submitButton').addEventListener('click', submit)
})
