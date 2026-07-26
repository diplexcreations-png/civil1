import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function JoinPage() {
  const { inviteId } = useParams<{ inviteId: string }>();
  useEffect(() => {
    if (inviteId) {
      window.location.href = `/project-management?invite=${inviteId}`;
    }
  }, [inviteId]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#0A84FF] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[10px] font-mono text-slate-400">Joining project...</p>
      </div>
    </div>
  );
}
