import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, CheckCheck, Pencil, Trash2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MessageBubbleProps {
  id: string;
  content: string;
  createdAt: string;
  isMine: boolean;
  isRead: boolean;
  isDeleted: boolean;
  editedAt: string | null;
  onEdit: (id: string, newContent: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  id, content, createdAt, isMine, isRead, isDeleted, editedAt, onEdit, onDelete,
}) => {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEdit = async () => {
    if (editText.trim() && editText.trim() !== content) {
      await onEdit(id, editText.trim());
    }
    setEditing(false);
  };

  const time = new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Tick indicators for sent messages
  const renderTicks = () => {
    if (!isMine) return null;
    if (isRead) {
      // Blue double tick — seen
      return <CheckCheck className="h-3.5 w-3.5 text-blue-400 inline-block ml-1" />;
    }
    // Grey double tick — delivered (web app, always delivered if in DB)
    return <CheckCheck className="h-3.5 w-3.5 opacity-60 inline-block ml-1" />;
  };

  if (isDeleted) {
    return (
      <div className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
        <div className={cn(
          'max-w-[70%] rounded-lg px-4 py-2 italic opacity-60',
          isMine ? 'bg-primary/30 text-primary-foreground/70' : 'bg-muted text-muted-foreground'
        )}>
          <p className="text-sm">🚫 This message was deleted</p>
          <p className={cn('text-xs mt-1', isMine ? 'text-primary-foreground/50' : 'text-muted-foreground/70')}>
            {time}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn('flex group', isMine ? 'justify-end' : 'justify-start')}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!isMine}>
            <div
              className={cn(
                'max-w-[70%] rounded-lg px-4 py-2 cursor-pointer relative',
                isMine
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              )}
            >
              {editing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="h-7 text-sm bg-background text-foreground"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEdit();
                      if (e.key === 'Escape') { setEditing(false); setEditText(content); }
                    }}
                  />
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleEdit}>
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setEditing(false); setEditText(content); }}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-sm">{content}</p>
                  <div className={cn(
                    'flex items-center gap-1 mt-1',
                    isMine ? 'justify-end' : ''
                  )}>
                    {editedAt && (
                      <span className={cn(
                        'text-[10px]',
                        isMine ? 'text-primary-foreground/50' : 'text-muted-foreground/70'
                      )}>edited</span>
                    )}
                    <span className={cn(
                      'text-xs',
                      isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}>
                      {time}
                    </span>
                    {renderTicks()}
                  </div>
                </>
              )}
            </div>
          </DropdownMenuTrigger>
          {isMine && !editing && (
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => { setEditing(true); setEditText(content); }}>
                <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>This message will be deleted for everyone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(id)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MessageBubble;
