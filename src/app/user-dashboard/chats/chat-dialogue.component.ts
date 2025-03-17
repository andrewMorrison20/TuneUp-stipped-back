import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {WebsocketService} from "../../services/websocket.service";
import {Message} from "stompjs";
import {HttpClient} from "@angular/common/http";
import {Client} from "@stomp/stompjs";
import {AuthenticatedUser} from "../../authentication/authenticated-user.class";
import {Conversation} from "./chats.component";
import {tap} from "rxjs/operators";


@Component({
  selector: 'app-chat-dialogue',
  templateUrl: './chat-dialogue.component.html',
  styleUrl: './chat-dialogue.component.scss'
})
export class ChatDialogueComponent implements OnInit {
  messages: any[] = [];
  newMessage = '';
  totalMessages = 0;
  hasMoreMessages = false;
  pageIndex = 0;
  pageSize = 20;

  private stompClient!: Client;

  constructor(
    public dialogRef: MatDialogRef<ChatDialogueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private websocketService: WebsocketService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    console.log(this.data)
    if (this.data.conversation) {
      // Existing conversation
      this.fetchMessages(this.data.conversation.id);
      console.log('convo',this.data.conversation)
    } else {
      // No conversation exists, fetch or create one
      this.startOrFetchConversation(this.data.userProfileId,this.data.participantId);
      console.log('convo',this.data.conversation)
    }

    this.fetchMessages(this.data.conversation.id);
    this.websocketService.subscribeToConversation(this.data.conversation.id).subscribe((newMessage: any) => {
      this.messages.push(newMessage);
    });
  }

  startOrFetchConversation(userProfileId: number, participantId: number): void {
    this.http.post<Conversation>(
      `http://localhost:8080/api/chats/conversation/start`,
      { userId: userProfileId, participantId: participantId }
    ).pipe(
      tap((conversation) => {
        this.data.conversation = conversation;
        this.fetchMessages(conversation.id);
      })
    ).subscribe({
      error: (error) => console.error("Error fetching or starting conversation:", error)
    });
  }


  fetchMessages(conversationId: number, pageIndex: number = 0, pageSize: number = 20): void {
    const token = AuthenticatedUser.getAuthUserToken();
    const url = `http://localhost:8080/api/chats/conversation/${conversationId}/messages?page=${pageIndex}&size=${pageSize}`;

    this.http.get<{ content: Message[], totalElements: number }>(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .subscribe(response => {
        this.messages = [...response.content, ...this.messages]; // Append new messages at the beginning
        this.totalMessages = response.totalElements;
        this.hasMoreMessages = response.content.length === pageSize; // Check if more messages exist
      });
  }


  onScroll(event: any): void {
    const scrollTop = event.target.scrollTop;

    if (scrollTop === 0 && this.hasMoreMessages) {
      this.pageIndex++;
      this.fetchMessages(this.data.conversation.id, this.pageIndex, this.pageSize);
    }
  }


  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    const message = {
      senderProfileId: this.data.userProfileId,
      conversationId: this.data.conversation.id,
      content: this.newMessage
    };
    console.log('MESSAGE',message);
    console.log(this.data.conversation)
    this.websocketService.sendMessage(this.data.conversation.id, message);
    this.newMessage = '';
  }

  close(): void {
    this.dialogRef.close();
  }

  isSameDay(timestamp1: string, timestamp2: string): boolean {
    const date1 = new Date(timestamp1).setHours(0, 0, 0, 0);
    const date2 = new Date(timestamp2).setHours(0, 0, 0, 0);
    return date1 === date2;
  }

  protected readonly AuthenticatedUser = AuthenticatedUser;
}


