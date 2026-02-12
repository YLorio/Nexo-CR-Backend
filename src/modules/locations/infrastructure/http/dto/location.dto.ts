import { ApiProperty } from '@nestjs/swagger';

export class DistritoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nombre: string;
}

export class CantonDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty({ type: [DistritoDto] })
  distritos: DistritoDto[];
}

export class ProvinciaDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty({ type: [CantonDto] })
  cantones: CantonDto[];
}
