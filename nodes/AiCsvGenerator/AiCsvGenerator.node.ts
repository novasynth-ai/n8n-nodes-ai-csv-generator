import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';

export class AiCsvGenerator implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'AI CSV Generator',
		name: 'aiCsvGenerator',
		icon: 'file:csv.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["fileName"]}}',
		description: 'Generate CSV files dynamically based on AI agent requests',
		defaults: {
			name: 'AI CSV Generator',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Generate CSV from Data',
						value: 'generateFromData',
						description: 'Create CSV from structured data input',
						action: 'Generate CSV from structured data',
					},
					{
						name: 'Generate CSV from Schema',
						value: 'generateFromSchema',
						description: 'Create CSV based on defined schema and sample data',
						action: 'Generate CSV from schema definition',
					},
					{
						name: 'Generate CSV from AI Request',
						value: 'generateFromAiRequest',
						description: 'Create CSV based on natural language AI request',
						action: 'Generate CSV from AI request',
					},
				],
				default: 'generateFromData',
			},
			{
				displayName: 'File Name',
				name: 'fileName',
				type: 'string',
				default: 'output.csv',
				placeholder: 'e.g., sales_report.csv',
				description: 'Name of the CSV file to generate',
			},
			{
				displayName: 'Include Headers',
				name: 'includeHeaders',
				type: 'boolean',
				default: true,
				description: 'Whether to include column headers in the CSV',
			},
			{
				displayName: 'Delimiter',
				name: 'delimiter',
				type: 'options',
				options: [
					{
						name: 'Comma (,)',
						value: ',',
					},
					{
						name: 'Semicolon (;)',
						value: ';',
					},
					{
						name: 'Tab',
						value: '\t',
					},
					{
						name: 'Pipe (|)',
						value: '|',
					},
				],
				default: ',',
				description: 'Character to use as field delimiter',
			},
			{
				displayName: 'Data Source',
				name: 'dataSource',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['generateFromData'],
					},
				},
				options: [
					{
						name: 'Input Data',
						value: 'inputData',
						description: 'Use data from previous node',
					},
					{
						name: 'Manual Data',
						value: 'manualData',
						description: 'Enter data manually',
					},
				],
				default: 'inputData',
			},
			{
				displayName: 'Manual Data (JSON)',
				name: 'manualData',
				type: 'json',
				displayOptions: {
					show: {
						operation: ['generateFromData'],
						dataSource: ['manualData'],
					},
				},
				default: '[\n  {\n    "name": "John Doe",\n    "email": "john@example.com",\n    "age": 30\n  },\n  {\n    "name": "Jane Smith",\n    "email": "jane@example.com",\n    "age": 25\n  }\n]',
				description: 'JSON array of objects to convert to CSV',
			},
			{
				displayName: 'Schema Definition',
				name: 'schemaDefinition',
				type: 'json',
				displayOptions: {
					show: {
						operation: ['generateFromSchema'],
					},
				},
				default: '{\n  "columns": [\n    {"name": "id", "type": "number", "required": true},\n    {"name": "name", "type": "string", "required": true},\n    {"name": "email", "type": "string", "required": false},\n    {"name": "created_date", "type": "date", "required": true}\n  ],\n  "rowCount": 10\n}',
				description: 'Schema definition for generating sample CSV data',
			},
			{
				displayName: 'AI Request',
				name: 'aiRequest',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				displayOptions: {
					show: {
						operation: ['generateFromAiRequest'],
					},
				},
				default: 'Create a CSV file with 50 rows of sample customer data including name, email, phone, address, and purchase history',
				placeholder: 'Describe what kind of CSV file you want to generate...',
				description: 'Natural language description of the CSV file to generate',
			},
			{
				displayName: 'Row Count',
				name: 'rowCount',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['generateFromSchema', 'generateFromAiRequest'],
					},
				},
				default: 10,
				description: 'Number of sample rows to generate',
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				options: [
					{
						name: 'CSV Content',
						value: 'content',
						description: 'Return CSV content as string',
					},
					{
						name: 'Binary Data',
						value: 'binary',
						description: 'Return CSV as downloadable binary file',
					},
					{
						name: 'Both',
						value: 'both',
						description: 'Return both content and binary data',
					},
				],
				default: 'content',
				description: 'How to output the generated CSV',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const fileName = this.getNodeParameter('fileName', i) as string;
				const includeHeaders = this.getNodeParameter('includeHeaders', i) as boolean;
				const delimiter = this.getNodeParameter('delimiter', i) as string;
				const outputFormat = this.getNodeParameter('outputFormat', i) as string;

				let csvData: any[] = [];
				let headers: string[] = [];

				switch (operation) {
					case 'generateFromData':
						const result = generateFromData(this, i);
						csvData = result.data;
						headers = result.headers;
						break;

					case 'generateFromSchema':
						const schemaResult = generateFromSchema(this, i);
						csvData = schemaResult.data;
						headers = schemaResult.headers;
						break;

					case 'generateFromAiRequest':
						const aiResult = generateFromAiRequest(this, i);
						csvData = aiResult.data;
						headers = aiResult.headers;
						break;

					default:
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
				}

				// Generate CSV content
				const csvContent = generateCsvContent(csvData, headers, includeHeaders, delimiter);

				// Prepare output based on format
				const outputData: INodeExecutionData = {
					json: {
						fileName,
						rowCount: csvData.length,
						columnCount: headers.length,
						operation,
					},
				};

				if (outputFormat === 'content' || outputFormat === 'both') {
					outputData.json.csvContent = csvContent;
				}

				if (outputFormat === 'binary' || outputFormat === 'both') {
					const binaryData = Buffer.from(csvContent, 'utf8');
					outputData.binary = {
						[fileName]: {
							data: binaryData.toString('base64'),
							mimeType: 'text/csv',
							fileName,
							fileExtension: 'csv',
						},
					};
				}

				returnData.push(outputData);

			} catch (error: any) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

function generateFromData(context: IExecuteFunctions, itemIndex: number): {data: any[], headers: string[]} {
	const dataSource = context.getNodeParameter('dataSource', itemIndex) as string;
	let data: any[] = [];

	if (dataSource === 'inputData') {
		const inputData = context.getInputData();
		data = inputData.map((item: INodeExecutionData) => item.json);
	} else {
		const manualData = context.getNodeParameter('manualData', itemIndex) as string;
		try {
			data = JSON.parse(manualData);
		} catch (error) {
			throw new NodeOperationError(context.getNode(), 'Invalid JSON in manual data');
		}
	}

	if (!Array.isArray(data) || data.length === 0) {
		throw new NodeOperationError(context.getNode(), 'Data must be a non-empty array');
	}

	// Extract headers from the first object
	const headers = Object.keys(data[0]);

	return { data, headers };
}

function generateFromSchema(context: IExecuteFunctions, itemIndex: number): {data: any[], headers: string[]} {
	const schemaDefinition = context.getNodeParameter('schemaDefinition', itemIndex) as string;
	const rowCount = context.getNodeParameter('rowCount', itemIndex) as number;

	let schema: any;
	try {
		schema = JSON.parse(schemaDefinition);
	} catch (error) {
		throw new NodeOperationError(context.getNode(), 'Invalid JSON in schema definition');
	}

	if (!schema.columns || !Array.isArray(schema.columns)) {
		throw new NodeOperationError(context.getNode(), 'Schema must contain a columns array');
	}

	const headers = schema.columns.map((col: any) => col.name);
	const data: any[] = [];

	// Generate sample data based on schema
	for (let i = 0; i < rowCount; i++) {
		const row: any = {};
		
		schema.columns.forEach((column: any) => {
			row[column.name] = generateSampleValue(column.type, i);
		});

		data.push(row);
	}

	return { data, headers };
}

function generateFromAiRequest(context: IExecuteFunctions, itemIndex: number): {data: any[], headers: string[]} {
	const aiRequest = context.getNodeParameter('aiRequest', itemIndex) as string;
	const rowCount = context.getNodeParameter('rowCount', itemIndex) as number;

	// Parse AI request to determine data structure
	const parsedRequest = parseAiRequest(aiRequest);
	
	const headers = parsedRequest.columns;
	const data: any[] = [];

	// Generate sample data based on AI request
	for (let i = 0; i < rowCount; i++) {
		const row: any = {};
		
		parsedRequest.columns.forEach((column: string) => {
			row[column] = generateSampleValueFromColumn(column, i);
		});

		data.push(row);
	}

	return { data, headers };
}

function parseAiRequest(request: string): {columns: string[]} {
	// Simple AI request parsing - in a real implementation, you might use NLP or AI APIs
	const commonPatterns = {
		customer: ['id', 'name', 'email', 'phone', 'address', 'city', 'country'],
		sales: ['id', 'product', 'quantity', 'price', 'total', 'date', 'customer_id'],
		employee: ['id', 'name', 'email', 'department', 'position', 'salary', 'hire_date'],
		product: ['id', 'name', 'description', 'price', 'category', 'stock', 'sku'],
		order: ['id', 'customer_id', 'product_id', 'quantity', 'total', 'status', 'date'],
	};

	let columns: string[] = [];

	// Check for specific patterns in the request
	const lowerRequest = request.toLowerCase();
	
	if (lowerRequest.indexOf('customer') !== -1) {
		columns = commonPatterns.customer;
	} else if (lowerRequest.indexOf('sales') !== -1 || lowerRequest.indexOf('purchase') !== -1) {
		columns = commonPatterns.sales;
	} else if (lowerRequest.indexOf('employee') !== -1 || lowerRequest.indexOf('staff') !== -1) {
		columns = commonPatterns.employee;
	} else if (lowerRequest.indexOf('product') !== -1 || lowerRequest.indexOf('inventory') !== -1) {
		columns = commonPatterns.product;
	} else if (lowerRequest.indexOf('order') !== -1) {
		columns = commonPatterns.order;
	} else {
		// Extract potential column names from the request
		const words = request.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
		const potentialColumns = words.filter(word => 
			word.length > 2 && 
			['the', 'and', 'with', 'for', 'csv', 'file', 'data', 'rows', 'create', 'generate'].indexOf(word.toLowerCase()) === -1
		);
		
		columns = potentialColumns.length > 0 ? potentialColumns.slice(0, 8) : ['id', 'name', 'value', 'date'];
	}

	return { columns };
}

function generateSampleValue(type: string, index: number): any {
	switch (type.toLowerCase()) {
		case 'number':
		case 'integer':
			return index + 1;
		case 'string':
		case 'text':
			return `Sample Text ${index + 1}`;
		case 'email':
			return `user${index + 1}@example.com`;
		case 'date':
			const date = new Date();
			date.setDate(date.getDate() - index);
			return date.toISOString().split('T')[0];
		case 'boolean':
			return index % 2 === 0;
		case 'phone':
			const phoneNum = String(index + 1);
			const paddedPhone = '0000'.substring(0, 4 - phoneNum.length) + phoneNum;
			return `+1-555-${paddedPhone}`;
		default:
			return `Value ${index + 1}`;
	}
}

function generateSampleValueFromColumn(columnName: string, index: number): any {
	const lowerColumn = columnName.toLowerCase();
	
	if (lowerColumn.indexOf('id') !== -1) {
		return index + 1;
	} else if (lowerColumn.indexOf('name') !== -1) {
		const names = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson'];
		return names[index % names.length];
	} else if (lowerColumn.indexOf('email') !== -1) {
		return `user${index + 1}@example.com`;
	} else if (lowerColumn.indexOf('phone') !== -1) {
		const phoneNum = String(index + 1000);
		const paddedPhone = '0000'.substring(0, 4 - phoneNum.length) + phoneNum;
		return `+1-555-${paddedPhone}`;
	} else if (lowerColumn.indexOf('address') !== -1) {
		return `${123 + index} Main St`;
	} else if (lowerColumn.indexOf('city') !== -1) {
		const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
		return cities[index % cities.length];
	} else if (lowerColumn.indexOf('country') !== -1) {
		const countries = ['USA', 'Canada', 'UK', 'Germany', 'France'];
		return countries[index % countries.length];
	} else if (lowerColumn.indexOf('price') !== -1 || lowerColumn.indexOf('total') !== -1 || lowerColumn.indexOf('salary') !== -1) {
		return (Math.random() * 1000 + 100).toFixed(2);
	} else if (lowerColumn.indexOf('quantity') !== -1 || lowerColumn.indexOf('stock') !== -1) {
		return Math.floor(Math.random() * 100) + 1;
	} else if (lowerColumn.indexOf('date') !== -1) {
		const date = new Date();
		date.setDate(date.getDate() - index);
		return date.toISOString().split('T')[0];
	} else if (lowerColumn.indexOf('status') !== -1) {
		const statuses = ['Active', 'Inactive', 'Pending', 'Completed', 'Cancelled'];
		return statuses[index % statuses.length];
	} else if (lowerColumn.indexOf('category') !== -1 || lowerColumn.indexOf('department') !== -1) {
		const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'];
		return categories[index % categories.length];
	} else {
		return `Sample ${index + 1}`;
	}
}

function generateCsvContent(data: any[], headers: string[], includeHeaders: boolean, delimiter: string): string {
	const rows: string[] = [];

	// Add headers if requested
	if (includeHeaders) {
		rows.push(headers.map(header => escapeCsvValue(header, delimiter)).join(delimiter));
	}

	// Add data rows
	data.forEach(row => {
		const values = headers.map(header => {
			const value = row[header];
			return escapeCsvValue(value, delimiter);
		});
		rows.push(values.join(delimiter));
	});

	return rows.join('\n');
}

function escapeCsvValue(value: any, delimiter: string): string {
	if (value === null || value === undefined) {
		return '';
	}

	const stringValue = String(value);
	
	// If the value contains the delimiter, newlines, or quotes, wrap it in quotes
	if (stringValue.indexOf(delimiter) !== -1 || stringValue.indexOf('\n') !== -1 || stringValue.indexOf('\r') !== -1 || stringValue.indexOf('"') !== -1) {
		// Escape existing quotes by doubling them
		const escapedValue = stringValue.replace(/"/g, '""');
		return `"${escapedValue}"`;
	}

	return stringValue;
}
