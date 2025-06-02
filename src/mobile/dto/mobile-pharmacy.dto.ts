export class MobilePharmacyDto {
  id: number;
  name: string;
  location: string;

  constructor(entity: any) {
    this.id = entity.id;
    this.name = entity.name;
    this.location = entity.location;
  }
}
