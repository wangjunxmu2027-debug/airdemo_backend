'use client';

import { useEffect, useMemo, useState } from 'react';

import { ImageUploader, type ImageUploaderValue } from '@/shared/blocks/common/image-uploader';

type AvatarUploaderFieldProps = {
  name: string;
  label?: string;
  defaultValue?: string;
};

export function AvatarUploaderField({
  name,
  label,
  defaultValue,
}: AvatarUploaderFieldProps) {
  const [value, setValue] = useState(defaultValue || '');

  useEffect(() => {
    setValue(defaultValue || '');
  }, [defaultValue]);

  const defaultPreviews = useMemo(
    () => (value ? [value] : []),
    [value]
  );

  const handleChange = (items: ImageUploaderValue[]) => {
    const first = items.find((item) => item.status === 'uploaded' && item.url);
    setValue(first?.url || '');
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <input type="hidden" name={name} value={value} />
      <ImageUploader
        allowMultiple={false}
        maxImages={1}
        defaultPreviews={defaultPreviews}
        onChange={handleChange}
      />
    </div>
  );
}
