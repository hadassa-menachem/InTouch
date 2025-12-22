import { NgModule } from '@angular/core';
import { LucideAngularModule, MessageCircle, Share, X } from 'lucide-angular';
import {
  Home,
  Search,
  PlusSquare,
  Heart,
  User,
  Bell,
  MessageSquare,
  LogIn,
  Send,
  Paperclip,
  Smile,
  Download,
  Pencil,
  Plus,
  MessageCircle as MessageCircleIcon,
  Share as ShareIcon,
  X as XIcon,
  Check,
  Bookmark,
  ZoomIn,
  Eye,
  Trash2,
  Type,
  Palette,
  Settings
} from 'lucide';

@NgModule({
  imports: [
    LucideAngularModule.pick({
      Home,
      Search,
      PlusSquare,
      Heart,
      User,
      Bell,
      MessageSquare,
      LogIn,
      Send,
      Paperclip,
      Smile,
      Download,
      Pencil,
      Plus,
      MessageCircle,
      Share,
      X,
      Check,
      Bookmark,
      ZoomIn,
      Eye,
      Trash2,
      Type,
      Palette,
      Settings
    })
  ],
  exports: [LucideAngularModule]
})
export class LucideIconsModule {}