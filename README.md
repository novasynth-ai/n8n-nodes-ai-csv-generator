# n8n-nodes-ai-csv-generator

An n8n community node that enables AI agents to dynamically generate CSV files based on user requests. This node provides flexible CSV generation capabilities with support for structured data input, schema-based generation, and natural language AI requests.

## Features

- **Multiple Generation Methods**: Generate CSV files from existing data, predefined schemas, or natural language AI requests
- **Dynamic Data Generation**: Create sample data based on intelligent parsing of user requirements
- **Flexible Output Options**: Output as CSV content string, binary file, or both
- **Customizable Formatting**: Support for different delimiters, headers, and file naming
- **AI-Powered Parsing**: Automatically interpret natural language requests to determine appropriate data structures
- **Schema-Based Generation**: Define custom schemas with data types for consistent sample data generation

## Installation

To install this community node in your n8n instance:

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-ai-csv-generator`
4. Agree to the risks of using community nodes
5. Select **Install**

After installation restart n8n to see the node in the nodes panel.

## Operations

### Generate CSV from Data

Convert existing structured data into CSV format.

**Parameters:**
- **Data Source**: Choose between input data from previous nodes or manually entered JSON data
- **Manual Data**: JSON array of objects (when using manual data source)
- **File Name**: Name for the generated CSV file
- **Include Headers**: Whether to include column headers
- **Delimiter**: Character to use as field separator (comma, semicolon, tab, pipe)
- **Output Format**: Return as content string, binary file, or both

**Example Input Data:**
```json
[
  {
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "department": "Engineering"
  },
  {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "age": 25,
    "department": "Marketing"
  }
]
```

### Generate CSV from Schema

Create CSV files based on predefined data schemas with sample data generation.

**Parameters:**
- **Schema Definition**: JSON schema defining columns, data types, and constraints
- **Row Count**: Number of sample rows to generate
- **File Name**: Name for the generated CSV file
- **Include Headers**: Whether to include column headers
- **Delimiter**: Character to use as field separator
- **Output Format**: Return as content string, binary file, or both

**Example Schema:**
```json
{
  "columns": [
    {"name": "id", "type": "number", "required": true},
    {"name": "name", "type": "string", "required": true},
    {"name": "email", "type": "email", "required": false},
    {"name": "created_date", "type": "date", "required": true},
    {"name": "active", "type": "boolean", "required": true}
  ],
  "rowCount": 50
}
```

**Supported Data Types:**
- `number/integer`: Sequential numbers starting from 1
- `string/text`: Generic sample text
- `email`: Generated email addresses
- `date`: Date values with variation
- `boolean`: Alternating true/false values
- `phone`: Formatted phone numbers

### Generate CSV from AI Request

Create CSV files based on natural language descriptions of the desired data structure.

**Parameters:**
- **AI Request**: Natural language description of the CSV file to generate
- **Row Count**: Number of sample rows to generate
- **File Name**: Name for the generated CSV file
- **Include Headers**: Whether to include column headers
- **Delimiter**: Character to use as field separator
- **Output Format**: Return as content string, binary file, or both

**Example AI Requests:**
- "Create a CSV file with customer data including name, email, phone, address, and purchase history"
- "Generate sales data with product information, quantities, prices, and dates"
- "Create employee records with personal details, department, position, and salary information"
- "Generate inventory data with product names, SKUs, categories, stock levels, and prices"

**Recognized Patterns:**
The node automatically recognizes common data patterns and generates appropriate columns:
- **Customer data**: id, name, email, phone, address, city, country
- **Sales data**: id, product, quantity, price, total, date, customer_id
- **Employee data**: id, name, email, department, position, salary, hire_date
- **Product data**: id, name, description, price, category, stock, sku
- **Order data**: id, customer_id, product_id, quantity, total, status, date

## Usage Examples

### Example 1: Converting API Response to CSV

```
HTTP Request Node → AI CSV Generator Node → Email Node
```

1. Fetch data from an API using HTTP Request node
2. Use AI CSV Generator with "Generate CSV from Data" operation
3. Set Data Source to "Input Data"
4. Configure file name and formatting options
5. Send the generated CSV file via email

### Example 2: Creating Sample Data for Testing

```
Manual Trigger → AI CSV Generator Node → Write Binary File Node
```

1. Use Manual Trigger to start the workflow
2. Configure AI CSV Generator with "Generate CSV from AI Request"
3. Enter request: "Create test user data with 100 rows including names, emails, and registration dates"
4. Set Row Count to 100
5. Save the generated CSV file to disk

### Example 3: Schema-Based Data Generation

```
Code Node → AI CSV Generator Node → HTTP Request Node
```

1. Use Code node to define a custom schema
2. Pass schema to AI CSV Generator with "Generate CSV from Schema" operation
3. Generate structured sample data
4. Upload the CSV to a cloud storage service via HTTP Request

## Output

The node returns an object containing:

```json
{
  "fileName": "output.csv",
  "rowCount": 10,
  "columnCount": 5,
  "operation": "generateFromAiRequest",
  "csvContent": "name,email,phone,address,city\nJohn Doe,john@example.com,+1-555-1000,123 Main St,New York\n...",
  "binary": {
    "output.csv": {
      "data": "base64-encoded-csv-content",
      "mimeType": "text/csv",
      "fileName": "output.csv",
      "fileExtension": "csv"
    }
  }
}
```

## Error Handling

The node includes comprehensive error handling for:
- Invalid JSON in manual data or schema definitions
- Empty or malformed input data
- Missing required parameters
- File generation errors

When "Continue on Fail" is enabled, errors are returned as part of the output data rather than stopping the workflow.

## Advanced Features

### Custom Value Generation

The node includes intelligent value generation based on column names:
- Columns containing "id" generate sequential numbers
- Columns containing "name" use realistic name samples
- Columns containing "email" generate valid email formats
- Columns containing "phone" create formatted phone numbers
- Columns containing "date" generate varied date values
- Columns containing "price" or "total" generate monetary values

### CSV Formatting

The node properly handles CSV formatting including:
- Escaping special characters in field values
- Wrapping fields containing delimiters in quotes
- Handling newlines and quotes within field values
- Supporting different delimiter types

## Development

### Building the Node

```bash
# Install dependencies
pnpm install

# Build the node
pnpm build

# Run in development mode
pnpm dev
```

### Testing

```bash
# Lint the code
pnpm lint

# Fix linting issues
pnpm lintfix

# Format code
pnpm format
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions about this node, please:
1. Check the [documentation](README.md)
2. Search existing [issues](https://github.com/your-username/n8n-nodes-ai-csv-generator/issues)
3. Create a new issue with detailed information about your problem

## Changelog

### Version 1.0.0
- Initial release
- Support for three generation methods: data, schema, and AI request
- Flexible output formatting options
- Comprehensive error handling
- AI-powered natural language parsing

