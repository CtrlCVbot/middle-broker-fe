import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { addresses } from '@/db/schema/addresses';
import { addressChangeLogs } from '@/db/schema/addressChangeLogs';
import { eq, inArray } from 'drizzle-orm';
import { IAddressBatchRequest, AddressType, IAddress } from '@/types/address';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as IAddressBatchRequest;
    const { addressIds, action } = body;

    if (!addressIds || !Array.isArray(addressIds) || addressIds.length === 0) {
      return NextResponse.json(
        { message: 'addressIds is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!action || !['delete', 'setFrequent', 'unsetFrequent'].includes(action)) {
      return NextResponse.json(
        { message: 'action must be one of: delete, setFrequent, unsetFrequent' },
        { status: 400 }
      );
    }

    const result = await db.transaction(async (tx) => {
      const processed: string[] = [];
      const failed: string[] = [];
      const errors: { id: string; error: string }[] = [];

      for (const id of addressIds) {
        try {
          const address = await tx.query.addresses.findFirst({
            where: eq(addresses.id, id),
          });

          if (!address) {
            failed.push(id);
            errors.push({ id, error: 'Address not found' });
            continue;
          }

          switch (action) {
            case 'delete':
              await tx.delete(addresses).where(eq(addresses.id, id));
              await tx.insert(addressChangeLogs).values({
                addressId: id,
                changedBy: req.headers.get('x-user-id') || 'system',
                changedByName: req.headers.get('x-user-name') || 'system',
                changedByEmail: req.headers.get('x-user-email') || 'system',
                changedByAccessLevel: req.headers.get('x-user-access-level') || 'system',
                changeType: 'delete',
                changes: JSON.stringify({
                  ...address,
                  type: address.type as AddressType,
                  metadata: address.metadata as IAddress['metadata']
                }),
              });
              break;

            case 'setFrequent':
            case 'unsetFrequent':
              await tx.update(addresses)
                .set({ isFrequent: action === 'setFrequent' })
                .where(eq(addresses.id, id));
              await tx.insert(addressChangeLogs).values({
                addressId: id,
                changedBy: req.headers.get('x-user-id') || 'system',
                changedByName: req.headers.get('x-user-name') || 'system',
                changedByEmail: req.headers.get('x-user-email') || 'system',
                changedByAccessLevel: req.headers.get('x-user-access-level') || 'system',
                changeType: 'update',
                changes: JSON.stringify({
                  isFrequent: action === 'setFrequent'
                }),
              });
              break;
          }

          processed.push(id);
        } catch (error) {
          failed.push(id);
          errors.push({ id, error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }

      return {
        success: true,
        processed,
        failed,
        errors: errors.length > 0 ? errors : undefined,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in batch processing addresses:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 