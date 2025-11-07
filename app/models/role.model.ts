import { Document, model, Schema } from 'mongoose';

export interface RoleInterface extends Document {
  name: string;
  permissions: string[];
}

const roleSchema: Schema = new Schema({
  name: { type: String,
     required: true, 
     unique: true 
    },
  permissions: [{ type: String }]
});

const roleModel = model<RoleInterface>('Role', roleSchema);
export {roleModel}