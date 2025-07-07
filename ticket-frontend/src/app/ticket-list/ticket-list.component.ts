import { Component, OnInit, TemplateRef } from '@angular/core';
import { TicketService, PaginatedTicketsResponse } from '../../services/ticket.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Ticket, TicketStatus } from '../models/ticket.model';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css']
})
export class TicketListComponent implements OnInit {

  public Math = Math;

  tickets: (Ticket & { selected?: boolean })[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalTickets: number = 0;
  totalPages: number = 0;
  pages: number[] = [];
  loading: boolean = false;

  // Modals properties
  modalRef?: BsModalRef;
  ticketForm!: FormGroup;
  isEditMode: boolean = false;
  currentTicketId: number | null = null;
  ticketStatuses = Object.values(TicketStatus);

  constructor(
    private ticketService: TicketService,
    private modalService: BsModalService,
    private fb: FormBuilder
  ) {
    console.log('TicketListComponent: Constructor called.');
    this.initTicketForm();
  }

  ngOnInit(): void {
    console.log('TicketListComponent: ngOnInit called. Initiating ticket load.');
    this.loadTickets();
  }

  /**
   * Initializes the reactive form for adding/editing tickets.
   */
  initTicketForm(): void {
    this.ticketForm = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      description: ['', Validators.required],
      creatorId: [null, [Validators.required, Validators.min(1)]],
      assigneeId: [null],
      status: [TicketStatus.OPEN]
    });
  }

  /**
   * Loads tickets from the backend with pagination.
   */
  loadTickets(): void {
    this.loading = true;
    console.log(`TicketListComponent: Loading tickets for page ${this.currentPage} with limit ${this.itemsPerPage}...`);

    this.ticketService.getTickets(this.currentPage, this.itemsPerPage).subscribe({
      next: (response: PaginatedTicketsResponse) => {
        console.log('TicketListComponent: Tickets loaded successfully:', response);
        this.tickets = response.data.map(ticket => ({ ...ticket, selected: false }));
        this.currentPage = response.page;
        this.itemsPerPage = response.limit;
        this.totalTickets = response.total;
        this.totalPages = response.totalPages;

        // Generate pages array dynamically based on totalPages
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.loading = false;
      },
      error: (error) => {
        console.error('TicketListComponent: Error loading tickets!', error);
        this.tickets = [];
        this.loading = false;
        alert('Failed to load tickets. Please check the console for details.');
      },
      complete: () => {
        console.log('TicketListComponent: Ticket fetching completed.');
      }
    });
  }

  /**
   * Handles the "Select All" checkbox.
   * @param event The change event from the checkbox.
   */
  toggleAll(event: Event): void {
    console.log('TicketListComponent: Toggle all checkbox clicked.');
    const checked = (event.target as HTMLInputElement).checked;
    this.tickets.forEach(ticket => (ticket.selected = checked));
  }

  /**
   * Initiates the bulk deletion of selected tickets.
   */
  deleteSelected(): void {
    const ids = this.tickets.filter(t => t.selected).map(t => t.id);

    if (ids.length === 0) {
      console.warn('TicketListComponent: No tickets selected for deletion.');
      alert('Please select at least one ticket to delete.');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${ids.length} selected tickets?`)) {
      return;
    }

    console.log('TicketListComponent: Sending bulk delete request for IDs:', ids);

    this.ticketService.deleteTicketsBulk(ids).subscribe({
      next: (response) => {
        console.log('TicketListComponent: Bulk delete request accepted:', response);
        alert('Bulk deletion request has been sent for processing. Tickets will be removed shortly.');
        // After successful deletion, unselect all and reload tickets
        this.tickets.forEach(ticket => (ticket.selected = false));
        this.loadTickets();
      },
      error: (error) => {
        console.error('TicketListComponent: Error sending bulk delete request!', error);
        alert('Failed to send bulk delete request. Please check the console for details.');
      }
    });
  }

  /**
   * Deletes a single ticket.
   * @param id The ID of the ticket to delete.
   */
  deleteTicket(id: number): void {
    if (!confirm(`Are you sure you want to delete ticket with ID ${id}?`)) {
      return;
    }

    console.log('TicketListComponent: Deleting single ticket with ID:', id);
    this.ticketService.deleteTicket(id).subscribe({
      next: () => {
        console.log(`TicketListComponent: Ticket with ID ${id} deleted successfully.`);
        this.loadTickets(); // Reload the list after deletion
      },
      error: (error) => {
        console.error(`TicketListComponent: Error deleting ticket with ID ${id}!`, error);
        alert(`Failed to delete ticket ${id}. Please check the console for details.`);
      }
    });
  }

  /**
   * Opens the modal for adding a new ticket.
   * @param template The HTML template reference for the modal.
   */
  openAddModal(template: TemplateRef<any>): void {
    console.log('TicketListComponent: Open Add Modal button clicked.');
    this.isEditMode = false;
    this.currentTicketId = null;
    // Reset the form and set default status for new tickets
    this.ticketForm.reset({ status: TicketStatus.OPEN });
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' }); // Open the modal
  }

  /**
   * Opens the modal for editing an existing ticket.
   * @param ticket The ticket object to edit.
   * @param template The HTML template reference for the modal.
   */
  editTicket(ticket: Ticket, template: TemplateRef<any>): void {
    console.log('TicketListComponent: Edit Ticket button clicked for:', ticket.id);
    this.isEditMode = true;
    this.currentTicketId = ticket.id;
    // Populate the form with the existing ticket data
    this.ticketForm.patchValue(ticket);
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' }); // Open the modal
  }

  /**
   * Handles saving a ticket (either creating a new one or updating an existing one).
   */
  saveTicket(): void {
    if (this.ticketForm.invalid) {
      // Mark all fields as touched to display validation errors
      this.ticketForm.markAllAsTouched();
      alert('Please fill in all required fields correctly.');
      return;
    }

    const ticketData = this.ticketForm.value;

    if (this.isEditMode && this.currentTicketId) {
      console.log('TicketListComponent: Updating ticket:', ticketData);

      this.ticketService.updateTicket(this.currentTicketId, ticketData).subscribe({
        next: () => {
          alert('Ticket updated successfully!');
          this.modalRef?.hide(); // Close the modal
          this.loadTickets();
        },
        error: (error) => {
          console.error('Error updating ticket:', error);
          alert('Failed to update ticket. Please check the console.');
        }
      });
    } else {
      console.log('TicketListComponent: Creating new ticket:', ticketData);

      this.ticketService.createTicket(ticketData).subscribe({
        next: () => {
          alert('Ticket created successfully!');
          this.modalRef?.hide();
          this.loadTickets();
        },
        error: (error) => {
          console.error('Error creating ticket:', error);
          alert('Failed to create ticket. Please check the console.');
        }
      });
    }
  }

  /**
   * Navigates to the previous page.
   */
  prevPage(): void {
    console.log('TicketListComponent: Previous page button clicked. Current page:', this.currentPage);
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadTickets();
    }
  }

  /**
   * Navigates to the next page.
   */
  nextPage(): void {
    console.log('TicketListComponent: Next page button clicked. Current page:', this.currentPage);
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadTickets();
    }
  }

  /**
   * Navigates to a specific page.
   * @param p The page number to navigate to.
   */
  goToPage(p: number): void {
    console.log('TicketListComponent: Go to page button clicked. Target page:', p);
    if (p >= 1 && p <= this.totalPages && p !== this.currentPage) {
      this.currentPage = p;
      this.loadTickets();
    }
  }

  /**
   * Changes the number of items displayed per page and reloads tickets.
   * @param event The change event from the select element.
   */
  onItemsPerPageChange(event: Event): void {
    const newLimit = parseInt((event.target as HTMLSelectElement).value, 10);
    if (!isNaN(newLimit) && newLimit > 0) {
      this.itemsPerPage = newLimit;
      this.currentPage = 1; // Reset to first page when items per page changes
      this.loadTickets();
    }
  }
}