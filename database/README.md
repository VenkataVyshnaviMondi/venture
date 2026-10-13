# MongoDB application database

`schema.prisma` is the active MongoDB schema. The existing `migrations/` and
`schemas/estatehub.sql` are historical MySQL artifacts, not deployment inputs.

Configure `DATABASE_URL` with a MongoDB replica-set URL (Atlas provides one).
Prisma uses transactions for nested writes and lead/customer updates.
UUID string IDs are mapped to MongoDB `_id` so the frontend retains its IDs.

Run from the repository root:

```sh
npm run prisma:generate -w server
npm run prisma:deploy -w server
```

The deploy command uses `db push`, then creates partial unique indexes for
non-null admin and employee codes. MongoDB does not use Prisma SQL migrations.
It does not import existing SQL records or the legacy Mongoose collections.
Those have different fields and need an explicit data conversion.

Optional local sample data: `npm run seed -w server`. This command deletes
application records and creates demonstration accounts; never run it on a live DB.
