import { Parser } from '@tableau/taco-toolkit/handlers'

export default class FreshdeskParser extends Parser {
  parse(fetcherResult, { dataContainer }) {
    const tableName = 'Freshdesk Tickets'

    const containerBuilder = Parser.createContainerBuilder(dataContainer)
    const { isNew, tableBuilder } = containerBuilder.getTable(tableName)

    if (isNew) {
      tableBuilder.addColumnHeaders([
        { id: 'id', dataType: 'string' },
        { id: 'subject', dataType: 'string' },
        { id: 'status', dataType: 'string' },
        { id: 'priority', dataType: 'string' },
        { id: 'created_at', dataType: 'datetime' },
        // Add more columns as needed
      ])
    }

    fetcherResult.forEach(ticket => {
      tableBuilder.addRow({
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        priority: ticket.priority,
        created_at: new Date(ticket.created_at)
        // Map other fields as needed
      })
    })

    return containerBuilder.getDataContainer()
  }
}
