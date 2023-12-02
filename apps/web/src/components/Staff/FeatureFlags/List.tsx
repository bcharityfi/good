import Loader from '@components/Shared/Loader';
import ToggleWithHelper from '@components/Shared/ToggleWithHelper';
import {
  AdjustmentsHorizontalIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { HEY_API_URL } from '@hey/data/constants';
import type { Features } from '@hey/types/hey';
import { Button, Card, EmptyState, ErrorMessage } from '@hey/ui';
import { formatDate } from '@lib/formatTime';
import getAuthWorkerHeaders from '@lib/getAuthWorkerHeaders';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { type FC, useState } from 'react';
import toast from 'react-hot-toast';

const List: FC = () => {
  const [flags, setFlags] = useState<Features[] | []>([]);

  const getAllFeatureFlags = async (): Promise<Features[] | []> => {
    try {
      const response = await axios.get(
        `${HEY_API_URL}/internal/feature/getAllFeatureFlags`,
        { headers: getAuthWorkerHeaders() }
      );
      const { data } = response;
      setFlags(data?.features || []);

      return data?.features || [];
    } catch (error) {
      return [];
    }
  };

  const { isLoading, error } = useQuery({
    queryKey: ['getAllFeatureFlags'],
    queryFn: getAllFeatureFlags
  });

  const deleteFeatureFlag = async (id: string) => {
    toast.promise(
      axios.post(
        `${HEY_API_URL}/internal/feature/deleteFeatureFlag`,
        { id },
        { headers: getAuthWorkerHeaders() }
      ),
      {
        loading: 'Deleting feature flag...',
        success: () => {
          setFlags(flags.filter((flag) => flag.id !== id));
          return 'Feature flag deleted';
        },
        error: 'Failed to delete feature flag'
      }
    );
  };

  return (
    <Card>
      <div className="flex items-center justify-between space-x-5 p-5">
        <div className="text-lg font-bold">Feature Flags</div>
        <Button>Create</Button>
      </div>
      <div className="divider" />
      <div className="p-5">
        {isLoading ? (
          <Loader message="Loading profiles..." />
        ) : !flags ? (
          <EmptyState
            message={<span>No feature flags found</span>}
            icon={
              <AdjustmentsHorizontalIcon className="text-brand-500 h-8 w-8" />
            }
            hideCard
          />
        ) : error ? (
          <ErrorMessage title="Failed to load feature flags" error={error} />
        ) : (
          <div className="space-y-5">
            {flags?.map((flag) => (
              <div key={flag.id} className="flex items-center justify-between">
                <ToggleWithHelper
                  on={flag.enabled}
                  setOn={() => {}}
                  heading={flag.key}
                  description={`Created on ${formatDate(
                    flag.createdAt
                  )} with priority ${flag.priority}`}
                />
                <Button
                  onClick={() => deleteFeatureFlag(flag.id)}
                  icon={<TrashIcon className="h-4 w-4" />}
                  outline
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default List;