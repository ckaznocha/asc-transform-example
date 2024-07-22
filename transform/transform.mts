import {
  CommonFlags,
  DecoratorFlags,
  ElementKind,
  Node,
  PropertyPrototype,
  Source,
} from "assemblyscript";
import { Transform } from "assemblyscript/transform";

import type {
  ClassPrototype,
  InterfacePrototype,
  Program,
} from "assemblyscript";

const iface_name = "assembly/index/AdderIface";
const class_name = "assembly/index/Adder";
const field_type = "string";
const field_name = "foo";
const field_value = "bar";
const field_source = Source.native.range;
const field_flags = CommonFlags.None;
const field_decorator_flags = DecoratorFlags.None;

const prop_name_identifier = Node.createIdentifierExpression(
  field_name,
  field_source
);
const prop_type_node_name = Node.createSimpleTypeName(field_type, field_source);
const prop_type_node = Node.createNamedType(
  prop_type_node_name,
  null,
  false,
  field_source
);
const iface_field_declaration = Node.createFieldDeclaration(
  prop_name_identifier,
  null,
  field_flags,
  prop_type_node,
  null,
  field_source
);
const class_field_initializer = Node.createStringLiteralExpression(
  field_value,
  field_source
);
const class_field_declaration = Node.createFieldDeclaration(
  prop_name_identifier,
  null,
  field_flags,
  prop_type_node,
  class_field_initializer,
  field_source
);

export default class extends Transform {
  override afterInitialize(program: Program) {
    let proto = program.lookup(iface_name);

    if (proto === null || proto.kind !== ElementKind.InterfacePrototype) {
      throw new Error("interface prototype not found");
    }

    const iface_proto = proto as InterfacePrototype;

    iface_proto.addInstance(
      field_name,
      PropertyPrototype.forField(
        field_name,
        iface_proto,
        iface_field_declaration,
        field_decorator_flags
      )
    );

    iface_proto.instanceMembers?.forEach((member) => {
      this.log(
        `interface '${iface_proto.name}' instance member: '${member.name}'`
      );
    });

    proto = program.lookup(class_name);

    if (proto === null || proto.kind !== ElementKind.ClassPrototype) {
      throw new Error("class prototype not found");
    }

    const class_proto = proto as ClassPrototype;

    if (!class_proto.interfacePrototypes?.includes(iface_proto)) {
      throw new Error("interface not implemented by class");
    }

    class_proto.addInstance(
      field_name,
      PropertyPrototype.forField(
        field_name,
        class_proto,
        class_field_declaration,
        field_decorator_flags
      )
    );

    class_proto.instanceMembers?.forEach((member) => {
      this.log(`class '${class_proto.name}' instance member: '${member.name}'`);
    });
  }
}
