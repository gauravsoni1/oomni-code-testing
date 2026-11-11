import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateProductDto } from './update-product.dto';

async function errorsFor(body: Record<string, unknown>) {
  const dto = plainToInstance(UpdateProductDto, body);
  const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
  return errors.map((e) => e.property);
}

describe('UpdateProductDto', () => {
  it('should accept an empty body', async () => {
    expect(await errorsFor({})).toEqual([]);
  });

  it('should accept a full valid body', async () => {
    expect(
      await errorsFor({
        name: 'Headphones',
        description: 'Nice',
        sku: 'HDPH-001',
        price: 19.99,
        active: false,
      }),
    ).toEqual([]);
  });

  it('should accept a single field', async () => {
    expect(await errorsFor({ price: 0 })).toEqual([]);
    expect(await errorsFor({ active: true })).toEqual([]);
  });

  it('should accept null description (clears it)', async () => {
    expect(await errorsFor({ description: null })).toEqual([]);
  });

  it.each([
    ['negative', -1],
    ['string', '10.00'],
    ['too many decimals', 1.234],
    ['too large', 100000000],
    ['NaN', NaN],
    ['null', null],
  ])('should reject %s price', async (_label, price) => {
    expect(await errorsFor({ price })).toEqual(['price']);
  });

  it('should reject empty or non-string name and sku', async () => {
    expect(await errorsFor({ name: '' })).toEqual(['name']);
    expect(await errorsFor({ name: 123 })).toEqual(['name']);
    expect(await errorsFor({ name: null })).toEqual(['name']);
    expect(await errorsFor({ sku: '' })).toEqual(['sku']);
    expect(await errorsFor({ sku: null })).toEqual(['sku']);
  });

  it('should reject non-boolean active', async () => {
    expect(await errorsFor({ active: 'yes' })).toEqual(['active']);
    expect(await errorsFor({ active: null })).toEqual(['active']);
  });

  it('should reject non-string description', async () => {
    expect(await errorsFor({ description: 42 })).toEqual(['description']);
  });

  it('should reject unknown properties', async () => {
    expect(await errorsFor({ id: 'other' })).toEqual(['id']);
  });
});
