import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http'; // Import HttpParams
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { Ticket } from '../app/models/ticket.model';

export interface PaginatedTicketsResponse {
  data: Ticket[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private baseUrl = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {
    console.log(`TicketService initialized. Base URL: ${this.baseUrl}`);
  }

  /**
   * Fetches a paginated list of tickets from the backend.
   * @param page The requested page number (1-indexed).
   * @param limit The number of items per page.
   * @returns An Observable of PaginatedTicketsResponse.
   */
  getTickets(page: number = 1, limit: number = 10): Observable<PaginatedTicketsResponse> {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('limit', limit.toString());

    console.log(`TicketService: Attempting to fetch tickets from ${this.baseUrl}?${params.toString()}`);

    return this.http.get<PaginatedTicketsResponse>(this.baseUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Deletes a single ticket by its ID.
   * @param id The ID of the ticket to delete.
   * @returns An Observable for the deletion operation.
   */
  deleteTicket(id: number): Observable<any> {
    console.log(`TicketService: Attempting to delete ticket with ID: ${id} from ${this.baseUrl}/${id}`);
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Initiates a bulk deletion of tickets by sending a list of IDs to the backend.
   * This is an asynchronous operation, and the backend responds immediately with an acceptance.
   * @param ids An array of ticket IDs to delete.
   * @returns An Observable for the bulk deletion request.
   */
  deleteTicketsBulk(ids: number[]): Observable<any> {
    const body = { ids: ids };
    console.log(`TicketService: Attempting bulk delete for IDs: ${ids.join(', ')} from ${this.baseUrl}/bulk-delete`);
    return this.http.post(`${this.baseUrl}/bulk-delete`, body).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Sends a request to create a new ticket.
   * @param ticket The ticket data (title, description, creatorId, optional assigneeId).
   */
  createTicket(ticket: { title: string, description: string, creatorId: number, assigneeId?: number }): Observable<Ticket> {
    return this.http.post<Ticket>(this.baseUrl, ticket).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Sends a request to update an existing ticket.
   * @param id The ID of the ticket to update.
   * @param ticket The partial ticket data to update (e.g., title, description, status, assigneeId).
   */
  updateTicket(id: number, ticket: Partial<Ticket>): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.baseUrl}/${id}/status`, ticket).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side or network error: ${error.error.message}`;
      console.error(`TicketService Error: ${errorMessage}`);
    } else {
      errorMessage = `Backend returned code ${error.status}, body was: ${JSON.stringify(error.error)}`;
      console.error(`TicketService Error: ${errorMessage}`);
    }

    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}