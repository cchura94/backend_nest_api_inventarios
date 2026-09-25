### Generar archivos migrations
```
npm run migration:generate --name=create_users_table
npm run migration:generate --name=create_categorias_table
npm run migration:generate --name=create_roles_permissions_table
npm run migration:generate --name=create_inventarios_table
```

### Migrar a la Base de datos
```
npm run migration:run
```