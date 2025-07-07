import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketListComponent } from './ticket-list.component';
import { TicketService } from '../../services/ticket.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TicketListComponent - Simplified', () => {
  let component: TicketListComponent;
  let fixture: ComponentFixture<TicketListComponent>;
  let ticketServiceSpy: jasmine.SpyObj<TicketService>;
  let modalServiceSpy: jasmine.SpyObj<BsModalService>;

  beforeEach(async () => {
    ticketServiceSpy = jasmine.createSpyObj('TicketService', ['getTickets']);
    modalServiceSpy = jasmine.createSpyObj('BsModalService', ['show']);

    await TestBed.configureTestingModule({
      declarations: [TicketListComponent],
      imports: [ReactiveFormsModule, FormsModule],
      providers: [
        { provide: TicketService, useValue: ticketServiceSpy },
        { provide: BsModalService, useValue: modalServiceSpy }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketListComponent);
    component = fixture.componentInstance;
  });

  it('should create the TicketListComponent successfully', () => {
    expect(component).toBeTruthy();
  });
});