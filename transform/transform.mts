import {
  CommonFlags,
  DecoratorFlags,
  ElementKind,
  FunctionPrototype,
  FunctionTypeNode,
  GETTER_PREFIX,
  IdentifierExpression,
  MethodDeclaration,
  NamedTypeNode,
  Node,
  ParameterKind,
  ParameterNode,
  PropertyPrototype,
  Range,
  SETTER_PREFIX,
  Source,
  SourceKind,
  TypeName,
} from "assemblyscript";
import { Transform } from "assemblyscript/transform";

import type {
  ClassPrototype,
  FieldDeclaration,
  InterfacePrototype,
  Program,
} from "assemblyscript";

const iface_name = "assembly/index/AdderIface";
const class_name = "assembly/index/Adder";
const field_type = "string";
const field_name = "foo";
const field_value = "bar";
const field_flags = CommonFlags.Overridden;
const field_decorator_flags = DecoratorFlags.None;
const field_range = new Range(0, 0);
field_range.source = new Source(
  SourceKind.Library,
  "assembly/index.ts",
  "foo: string;"
);

const prop_name_identifier = Node.createIdentifierExpression(
  field_name,
  field_range
);
const prop_type_node_name = Node.createSimpleTypeName(field_type, field_range);
const prop_type_node = Node.createNamedType(
  prop_type_node_name,
  null,
  false,
  field_range
);
const iface_field_declaration = Node.createFieldDeclaration(
  prop_name_identifier,
  null,
  field_flags,
  prop_type_node,
  null,
  field_range
);
const class_field_initializer = Node.createStringLiteralExpression(
  field_value,
  field_range
);
const class_field_declaration = Node.createFieldDeclaration(
  prop_name_identifier,
  null,
  field_flags,
  prop_type_node,
  class_field_initializer,
  field_range
);

export default class extends Transform {
  override afterInitialize(program: Program) {
    let proto = program.lookup(iface_name);

    if (proto === null || proto.kind !== ElementKind.InterfacePrototype) {
      throw new Error("interface prototype not found");
    }

    const iface_proto = proto as InterfacePrototype;

    const iface_prop = property_prototype_for_iface_field(
      field_name,
      iface_proto,
      iface_field_declaration
    );

    iface_proto.addInstance(field_name, iface_prop);

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

    const class_prop = PropertyPrototype.forField(
      field_name,
      class_proto,
      class_field_declaration,
      field_decorator_flags
    );

    class_proto.addInstance(field_name, class_prop);

    iface_prop.getterPrototype?.unboundOverrides?.add(
      class_prop.getterPrototype!
    );

    iface_prop.setterPrototype?.unboundOverrides?.add(
      class_prop.setterPrototype!
    );

    class_proto.instanceMembers?.forEach((member) => {
      this.log(`class '${class_proto.name}' instance member: '${member.name}'`);
    });
  }
}

// Modified version of PropertyPrototype.forField
// https://github.com/AssemblyScript/assemblyscript/blob/f79391c91a0875e98a6e887b3353210b4125dc87/src/program.ts#L3981C10-L4040C4
function property_prototype_for_iface_field(
  name: string,
  parent: ClassPrototype,
  fieldDeclaration: FieldDeclaration
): PropertyPrototype {
  const nativeRange = Source.native.range;
  const typeNode = fieldDeclaration.type;
  if (typeNode === null) {
    throw new Error("type node not found");
  }

  const getterDeclaration = new MethodDeclaration(
    fieldDeclaration.name,
    fieldDeclaration.decorators,
    fieldDeclaration.flags | CommonFlags.Instance | CommonFlags.Get,
    null,
    new FunctionTypeNode([], typeNode, null, false, nativeRange),
    null,
    nativeRange
  );

  const setterDeclaration = new MethodDeclaration(
    fieldDeclaration.name,
    fieldDeclaration.decorators,
    fieldDeclaration.flags | CommonFlags.Instance | CommonFlags.Set,
    null,
    new FunctionTypeNode(
      [
        new ParameterNode(
          ParameterKind.Default,
          fieldDeclaration.name,
          typeNode,
          null,
          nativeRange
        ),
      ],
      new NamedTypeNode(
        new TypeName(
          new IdentifierExpression("", false, nativeRange),
          null,
          nativeRange
        ),
        null,
        false,
        nativeRange
      ),
      null,
      false,
      nativeRange
    ),
    null,
    nativeRange
  );

  const prototype = new PropertyPrototype(name, parent, getterDeclaration);

  prototype.getterPrototype = new FunctionPrototype(
    GETTER_PREFIX + name,
    parent,
    getterDeclaration,
    DecoratorFlags.None
  );

  prototype.getterPrototype.unboundOverrides = new Set<FunctionPrototype>();

  prototype.setterPrototype = new FunctionPrototype(
    SETTER_PREFIX + name,
    parent,
    setterDeclaration,
    DecoratorFlags.None
  );

  prototype.setterPrototype.unboundOverrides = new Set<FunctionPrototype>();

  return prototype;
}
