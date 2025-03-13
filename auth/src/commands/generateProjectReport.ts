// src/commands/generateProjectReport.ts
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { connectDB, disconnectDB } from '../config/db.config';
import mongoose from 'mongoose';
import express from 'express';
import { Router } from 'express';

const program = new Command();

// Function to get all registered models
const getRegisteredModels = (): Record<string, any> => {
    const models: Record<string, any> = {};

    // Get all registered models
    Object.keys(mongoose.models).forEach((modelName) => {
        const model = mongoose.models[modelName];
        const schema = model.schema;

        // Get all paths in the schema
        const paths: Record<string, any> = {};
        schema.eachPath((pathname: string, schematype: any) => {
            paths[pathname] = {
                type: schematype.instance,
                required: schematype.isRequired || false,
                default: schematype.defaultValue,
                unique: schematype.options.unique || false,
            };
        });

        models[modelName] = {
            paths,
            collection: model.collection.name,
        };
    });

    return models;
};

// Function to get all registered routes
const getRegisteredRoutes = (app: express.Application): string[] => {
    const routes: string[] = [];

    // Function to extract routes recursively
    const extractRoutes = (stack: any[], basePath = ''): void => {
        stack.forEach((layer) => {
            if (layer.route) {
                // It's a route
                const route = layer.route;
                const path = basePath + route.path;
                const methods = Object.keys(route.methods)
                    .filter((method) => route.methods[method])
                    .map((method) => method.toUpperCase());

                methods.forEach((method) => {
                    routes.push(`${method} ${path}`);
                });
            } else if (layer.name === 'router' && layer.handle.stack) {
                // It's a router
                const routerPath = (layer.regexp.toString().match(/^\/\^((?:\\\/)?[^\/\(]*)/i) || [])[1]
                    .replace(/\\\//g, '/');

                extractRoutes(layer.handle.stack, basePath + routerPath);
            }
        });
    };

    // Get all routes from the application
    if (app._router && app._router.stack) {
        extractRoutes(app._router.stack);
    }

    return routes;
};

program
    .name('generate_project_report')
    .description('Output project metadata (models and URLs) as JSON')
    .option('-o, --output <path>', 'Output file path (default: project_report.json)')
    .action(async (options) => {
        try {
            // Connect to database
            await connectDB();

            // Get all registered models
            const models = getRegisteredModels();

            // Create a temporary Express app to register routes
            const app = express();

            // Import all route files
            try {
                const routesDir = path.join(__dirname, '../routes');
                const routeFiles = fs.readdirSync(routesDir);

                for (const file of routeFiles) {
                    if (file.endsWith('.ts') || file.endsWith('.js')) {
                        const routePath = path.join(routesDir, file);
                        // Dynamic import
                        const route = await import(routePath);
                        const router: Router = route.default;

                        // Get the route prefix from the file name (e.g., auth.routes.ts -> /auth)
                        const routePrefix = `/api/v1/${file.split('.')[0]}`;

                        // Register the router with the app
                        app.use(routePrefix, router);
                    }
                }
            } catch (error) {
                console.error('Error loading routes:', error);
            }

            // Get all registered routes
            const routes = getRegisteredRoutes(app);

            // Generate the report
            const report = {
                models,
                routes,
                generatedAt: new Date().toISOString(),
            };

            // Write the report to file
            const outputPath = options.output || 'project_report.json';
            fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

            console.log(`Project report generated successfully: ${outputPath}`);

            await disconnectDB();
            process.exit(0);
        } catch (error) {
            console.error('Error generating project report:', error);
            await disconnectDB();
            process.exit(1);
        }
    });

program.parse(process.argv);