/**
 * @file app/provider/shard-provider.js
 * @description Shared shard provider instance for the whole application.
 */

import { FireShardProvider, getFriendlyMessage } from '@xbensommo/shard-provider';
import { toast } from 'vue-sonner';
import { db } from '@app/firebase/index.js';
import { definedCollections } from '@generated/collections.js';

/**
 * Shared shard provider instance.
 *
 * Exactly one provider instance exists for the whole application. Apps and
 * features only contribute collection definitions; they do not create provider
 * instances themselves.
 */
const shardProvider = new FireShardProvider({
  db,
  collections: definedCollections,
  strictSchemas: true,
  onError: (error) => {
    console.error('[ShardProvider]', {
      collection: error?.collection,
      operation: error?.operation,
      field: error?.field,
      code: error?.code,
      message: error?.message,
      publicMessage: error?.publicMessage,
    });

    toast.error('Action Failed', {
      description: getFriendlyMessage(error),
      duration: 8000,
    });
  },
});

export default shardProvider;
