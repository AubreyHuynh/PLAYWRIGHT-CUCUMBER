import * as path from 'path';
import * as fs from 'fs';
import { User } from '../data/builders/UserBuilder';
import { ApiCreateAccountRequest } from './models';

function loadTemplate(name: string): Record<string, string> {
  const file = path.join(__dirname, 'payloads', 'request', `${name}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

export function buildCreateAccountPayload(user: User): ApiCreateAccountRequest {
  const base = loadTemplate('createAccount');
  return {
    ...base,
    name: user.name,
    email: user.email,
    password: user.password,
    firstname: user.firstName,
    lastname: user.lastName,
    address1: user.address,
    state: user.state,
    city: user.city,
    zipcode: user.zipcode,
    mobile_number: user.mobileNumber,
  };
}

export function toFormParams(data: Record<string, string | undefined>): URLSearchParams {
  const form = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) form.set(key, value);
  }
  return form;
}
