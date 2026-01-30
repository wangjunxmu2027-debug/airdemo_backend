'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';

export function InviteAdminButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(false);

  const onInvite = async () => {
    if (!email || !email.includes('@')) {
      toast.error('请输入有效邮箱');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (res.ok && json.code === 0) {
        setInviteLink(json.data.link);
        toast.success('邀请已创建');
      } else {
        toast.error(json.message || '创建失败');
      }
    } catch (e: any) {
      toast.error(e.message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">邀请管理员</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>邀请管理员</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">邮箱</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={onInvite} disabled={loading}>
              发送邀请
            </Button>
          </div>
          {inviteLink && (
            <div className="rounded-md border p-3 text-sm">
              邀请链接：
              <a
                className="text-primary underline"
                href={inviteLink}
                target="_blank"
                rel="noreferrer"
              >
                {inviteLink}
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
