// src/app/lucide.module.ts
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
  Check // ✅ ייבוא האייקון ✔
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
    })
  ],
  exports: [LucideAngularModule]
})
export class LucideIconsModule {}
