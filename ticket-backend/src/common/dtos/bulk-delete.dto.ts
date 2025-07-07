import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, ArrayMinSize } from 'class-validator';

export class BulkDeleteTicketsDto {
  @ApiProperty({
    description: 'A list of ticket IDs to be deleted.',
    type: [Number],
    example: [1, 5, 10],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  ids: number[];
}