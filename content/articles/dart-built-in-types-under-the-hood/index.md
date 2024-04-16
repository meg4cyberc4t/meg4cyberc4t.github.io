---
title: "Dart: Built-in types under the hood"
date: "2024-07-09"
summary: "About what the built-in types in the Dart language are and how they work."
description: "About what the built-in types in the Dart language are and how they work."
readTime: true
autonumber: true
math: true
tags: ["dart", "compilers"]
showTags: true
highlight: true
article: true
---

It was just a regular day of coding until I wondered: “How does a language like Dart manage to provide a single behavior for such a large number of target platforms?”. If you think about it that way, then you can compile your Dart code into binaries, executables, snapshots, interpret the code in JavaScript or WebAssembly, and eventually get the same behavior everywhere. “Is it true? There must be a lot of developer work behind this…” I thought and decided to figure it out.

As an object of research, I decided to consider the work of built-in types.

![The cat looks under the hood](cat_looks_under_the_hood.png)

## How do the built-in types work?

Built-in types are `bool`, `int`, `String` and others that we find in every programming language. I will not stop to explain each of them, for that you can refer to [this documentation](https://dart.dev/language/built-in-types).

The general interface of these types are described in `dart:core`. This is one of the internal libraries of the SDK. **It is automatically imported into each file.**

However, if you pay attention to the class headers inside, you will notice that they only provide type signatures, but do not implement them.


{{< markdown-alt
  src="sdk/lib/core/int.dart"
  link="https://github.com/dart-lang/sdk/blob/b82383953d070e6aaad636413b9fcf06e385e985/sdk/lib/core/int.dart"
  caption="Int type abstraction"
>}}
```dart
abstract final class int extends num {
  external const factory int.fromEnvironment(String name,
      {int defaultValue = 0});

  int operator &(int other);

  int modPow(int exponent, int modulus);
  // ...
}
```
{{< /markdown-alt >}}

{{< markdown-alt
  src="sdk/lib/core/string.dart"
  link="https://github.com/dart-lang/sdk/blob/b82383953d070e6aaad636413b9fcf06e385e985/sdk/lib/core/string.dart"
  caption="String type abstraction"
>}}
```dart
abstract final class String implements Comparable<String>, Pattern {
  external factory String.fromCharCodes(Iterable<int> charCodes,
      [int start = 0, int? end]);

  String operator [](int index);

  int codeUnitAt(int index);
  // ...
}
```
{{< /markdown-alt >}}

This is done because the implementation of these types depends on the platform and its variant on which it will be compiled.

When compiling your code to native ([self-contained executables](https://dart.dev/tools/dart-compile#exe), [JIT modules](https://dart.dev/tools/dart-compile#jit-snapshot)), then under the hood you will use the Dart virtual machine ([_Dart VM_](https://github.com/dart-lang/sdk/tree/main/runtime)), but when building in the web, we will use the JavaScript interpretation instead. How do we specify the necessary implementation of our types without considering the nuances of the platform? For this purpose, there are **_patches_** available in the Dart language.

Here's how patches work:

- There is a class that defines the interface for a type. For example, let's look at `Null`:

  {{< markdown-alt
  src="sdk/lib/core/null.dart"
  link="https://github.com/dart-lang/sdk/blob/b82383953d070e6aaad636413b9fcf06e385e985/sdk/lib/core/null.dart#L23C1-L33"
  >}}
  ```dart
  /// The reserved word `null` denotes an object that is the sole instance of
  /// this class.
  @pragma("vm:entry-point")
  final class Null {
    factory Null._uninstantiable() {
      throw UnsupportedError('class Null cannot be instantiated');
    }

    external int get hashCode;

    /// Returns the string `"null"`.
    String toString() => "null";
  }
  ```
  {{< /markdown-alt >}}

  Those getters and constructors that will need a platform implementation are marked as `external`. This is how we will inform the compiler that the implementation of these things is located elsewhere.
  In our case, we will denote the `hashCode` as external for all patches for `Null`.

  Here are patches for this class: files that implement the necessary implementation depending on the platform. You can find patches for `Null` inside the SDK in the following directories:

  - [_sdk/lib/\_internal/vm_shared/lib/null_patch.dart_](https://github.com/dart-lang/sdk/blob/main/sdk/lib/_internal/vm_shared/lib/null_patch.dart)
  - [_sdk/lib/\_internal/js_dev_runtime/patch/core_patch.dart_](https://github.com/dart-lang/sdk/blob/b82383953d070e6aaad636413b9fcf06e385e985/sdk/lib/_internal/js_dev_runtime/patch/core_patch.dart#L71-L75)
  - [_sdk/lib/\_internal/js_runtime/patch/core_patch.dart_](https://github.com/dart-lang/sdk/blob/b82383953d070e6aaad636413b9fcf06e385e985/sdk/lib/_internal/js_runtime/lib/core_patch.dart#L76-L80)

  Let's take a look at one of them:

  {{< markdown-alt
    src="sdk/lib/\_internal/vm_shared/lib/null_patch.dart"
    link="https://github.com/dart-lang/sdk/blob/main/sdk/lib/_internal/vm_shared/lib/null_patch.dart"
    caption="patch for Dart VM"
  >}}
```dart
// Copyright (c) 2013, the Dart project authors.  Please see the AUTHORS file
// for details. All rights reserved. Use of this source code is governed by a
// BSD-style license that can be found in the LICENSE file.

import "dart:_internal" show patch;

@patch // <--
@pragma('vm:deeply-immutable')
@pragma("vm:entry-point")
class Null {
  static const _HASH_CODE = 2011; // The year Dart was announced and a prime.

  @patch // <--
  int get hashCode => _HASH_CODE;

  int get _identityHashCode => _HASH_CODE;
}
```
  {{< /markdown-alt >}}

  A class with a platform implementation is a class of the same name as the main one, which is marked with the `@patch` annotation. These classes provide platform implementations. These implementations are also marked with the `@patch` annotation.

  > 💡 Patches cannot change the signature of methods or functions, only their implementation.

  The patch annotation is declared as follows:

  {{< markdown-alt
    src="sdk/lib/internal/patch.dart"
    link="https://github.com/dart-lang/sdk/blob/main/sdk/lib/internal/patch.dart"
    caption="patch annotation"
  >}}
  ```dart
  part of dart._internal;

  class _Patch {
    const _Patch();
  }

  const _Patch patch = const _Patch();
  ```
  {{< /markdown-alt >}}

  It is available in `dart:_internal`, an internal SDK package that is not available to the outside world. During the compilation process, we pass the path to the necessary patches to the compiler, which it combines with the main code.

  {{< markdown-alt
    src="pkg/front_end/lib/src/source/source_loader.dart:540-542"
    link="https://github.com/dart-lang/sdk/blob/ad5fa7f5e4b90cb13d4093aa10916211405a898a/pkg/front_end/lib/src/source/source_loader.dart#L540C4-L542C6"
    caption="createSourceCompilationUnit"
  >}}
  ```dart
  if (uri.isScheme("dart")) {
    target.readPatchFiles(libraryBuilder);
  }
  ```
  {{< /markdown-alt >}}

  {{< markdown-alt
    src="pkg/front_end/lib/src/kernel/kernel_target.dart:1811-1824"
    link="https://github.com/dart-lang/sdk/blob/ad5fa7f5e4b90cb13d4093aa10916211405a898a/pkg/front_end/lib/src/kernel/kernel_target.dart#L1811C2-L1825C1"
    caption="readPatchFiles"
  >}}
  ```dart
  void readPatchFiles(SourceLibraryBuilder libraryBuilder) {
    assert(libraryBuilder.importUri.isScheme("dart"));
    List<Uri>? patches =
        uriTranslator.getDartPatches(libraryBuilder.importUri.path);
    if (patches != null) {
      for (Uri patch in patches) {
        libraryBuilder.loader.read(patch, -1,
            fileUri: patch,
            origin: libraryBuilder,
            accessor: libraryBuilder.compilationUnit,
            isPatch: true);
      }
    }
  }
  ```
  {{< /markdown-alt >}}

  In order for the language to identify necessary patches, these patches need to be described in the `libraries.yaml` file inside SDK (and the `libraries.json` file which is generated from it). For example, this is how patches for the `dart:core` library, which is used to build code with VM, declared:

{{< markdown-alt
    src="sdk/lib/libraries.yaml"
    link="https://github.com/dart-lang/sdk/blob/main/sdk/lib/libraries.yaml"
  >}}
```yaml
  vm_common:
    libraries:
      core:
        uri: "core/core.dart"
        patches:
          - "_internal/vm/lib/core_patch.dart"
          - "_internal/vm_shared/lib/array_patch.dart"
          - "_internal/vm_shared/lib/bigint_patch.dart"
          - "_internal/vm_shared/lib/bool_patch.dart"
          - "_internal/vm_shared/lib/date_patch.dart"
          - "_internal/vm_shared/lib/integers_patch.dart"
          - "_internal/vm_shared/lib/map_patch.dart"
          - "_internal/vm_shared/lib/null_patch.dart"
          - "_internal/vm_shared/lib/string_buffer_patch.dart"

  vm:
    include:
      - target: "vm_common"
    libraries:
      cli:
        uri: "cli/cli.dart"
```
  {{< /markdown-alt >}}


  The `libraries.json` is the basis ([not counting the analyzer](https://github.com/dart-lang/sdk/issues/28836#issuecomment-401180706)) for specifying packages and patches for each target platform. When running `dart run` or `dart compile`, the platform accesses it to find the necessary information and then collects the “patched” code automatically in build.

  > When compiling your code, you can get information about an internal package that has been included. This is done using `bool.fromEnvironment('dart.library.name')` where **_name_** is the package name.
  This is how global web constants are obtained:  
  ```dart
   const bool kIsWeb = bool.fromEnvironment('dart.library.js_util');
   const bool kIsWasm = kIsWeb && bool.fromEnvironment('dart.library.ffi');
  ```

  Finally, during the build to a target platform, the built-in types are assembled exclusively with their implementation for that platform 🙂.

## Built-in types on platforms: Web

An important detail to keep in mind, if we are talking about web, is that Dart _interprets_ code in JavaScript or WebAssembly. Using built-in types means using the types of these languages. And in many ways they match, but there are a couple of limitations.

| Dart type | JavaScript type | WebAssembly type    |
| --------- | --------------- | ------------------- |
| int       | number          | i32, i64            |
| double    | number          | f32, f64            |
| String    | string          | i8 array, i16 array |
| bool      | boolean         | i32                 |

When compiling to JavaScript, integers are restricted to values that can be represented exactly by double-precision floating point values. The available integer values include all integers between -(2^53) and 2^53, and some integers with larger magnitude. That includes some integers larger than 2^63.
The behavior of the operators and methods in the `int` class therefore sometimes differs between the Dart VM and Dart code compiled to JavaScript. For example, the bitwise operators truncate their operands to 32-bit integers when compiled to JavaScript.

```dart
int a = 0xFFFFFFFF + 3;
print(a); // Dart VM: 4294967295
print(a); // JavaScript: 4294967298

int c = a >> 2;
print(c); // Dart VM: 1073741823
print(c); // JavaScript: 0
```

WebAssembly has also received special attention because it can invoke JavaScript to execute code. That's why in `libraries.json` you can see `wasm`, `wasm_js_compatibility` and `wasm_common` targets. The latter is used to specify common patches.

[The JS compatibility](https://api.dart.dev/stable/3.4.4/dart-js_interop/dart-js_interop-library.html) and [static next-generation JS interop](https://dart.dev/interop/js-interop#next-generation-js-interop) allows you to access the browser's API from Dart code compiled to WebAssembly ([`package:web`](https://pub.dev/packages/web)).

## Built-in types on platforms: Dart VM

When compiling the code for Dart VM, note that each built-in type described in Dart is represented in C++. For example, this is how the representation of the `bool` type looks like:

{{< markdown-alt
    src="runtime/vm/object.h::Bool"
    link="https://github.com/dart-lang/sdk/blob/b82383953d070e6aaad636413b9fcf06e385e985/runtime/vm/object.h#L10797"
  >}}
  ```cpp
// Class Bool implements Dart core class bool.
class Bool : public Instance {
 public:
  bool value() const { return untag()->value_; }

  static intptr_t InstanceSize() {
    return RoundedAllocationSize(sizeof(UntaggedBool));
  }

  static const Bool& True() { return Object::bool_true(); }

  static const Bool& False() { return Object::bool_false(); }

  static const Bool& Get(bool value) {
    return value ? Bool::True() : Bool::False();
  }

  virtual uint32_t CanonicalizeHash() const {
    return ptr() == True().ptr() ? kTrueIdentityHash : kFalseIdentityHash;
  }

 private:
  FINAL_HEAP_OBJECT_IMPLEMENTATION(Bool, Instance);
  friend class Class;
  friend class Object;  // To initialize the true and false values.
};
```
{{< /markdown-alt >}}


Most of the values will be stored in the garbage-collected heap. Thanks to this, Dart developers do not have to worry about manually allocating and freeing memory.

Values such as `true`, `false`, and `null` will be considered immutable and will be automatically added to heap. This is done so that subsequent uses of bools do not take up more memory, but access already existing values. They are all allocated in the non-GC'd [`Dart::vm_isolate_`](https://github.com/dart-lang/sdk/blob/87676264371a01e83b7899d01b853306828af758/runtime/vm/dart.cc#L63C16-L63C27).

{{< markdown-alt
    src="runtime/vm/object.cc::InitNullAndBool"
    link="https://github.com/dart-lang/sdk/blob/b82383953d070e6aaad636413b9fcf06e385e985/runtime/vm/object.cc#L563-L599"
  >}}
```cpp
// Allocate and initialize the null instance.
// 'null_' must be the first object allocated as it is used in allocation to
// clear the pointer fields of objects.
{
  uword address =
      heap->Allocate(thread, Instance::InstanceSize(), Heap::kOld);
  null_ = static_cast<InstancePtr>(address + kHeapObjectTag);
  InitializeObjectVariant<Instance>(address, kNullCid);
  null_->untag()->SetCanonical();
}
// ...
{
  // Allocate true.
  uword address = heap->Allocate(thread, Bool::InstanceSize(), Heap::kOld);
  true_ = static_cast<BoolPtr>(address + kHeapObjectTag);
  InitializeObject<Bool>(address);
  true_->untag()->value_ = true;
  true_->untag()->SetCanonical();
}
{
  // Allocate false.
  uword address = heap->Allocate(thread, Bool::InstanceSize(), Heap::kOld);
  false_ = static_cast<BoolPtr>(address + kHeapObjectTag);
  InitializeObject<Bool>(address);
  false_->untag()->value_ = false;
  false_->untag()->SetCanonical();
}
```
{{< /markdown-alt >}}

By the way, in patches for a virtual machine, you will often see a special pragma `"vm:external-name"`. The implementation of such methods can be found in the code of the VM.


{{< markdown-alt
  src="sdk/lib/\_internal/vm_shared/lib/bool_patch.dart"
  link="https://github.com/dart-lang/sdk/blob/b82383953d070e6aaad636413b9fcf06e385e985/sdk/lib/_internal/vm_shared/lib/bool_patch.dart#L7-L16"
>}}
```dart
@patch
@pragma('vm:deeply-immutable')
@pragma("vm:entry-point")
class bool {
  @patch
  @pragma("vm:external-name", "Bool_fromEnvironment")
  external const factory bool.fromEnvironment(String name,
      {bool defaultValue = false});
  // ...
}
```
{{< /markdown-alt >}}


{{< markdown-alt
  src="runtime/lib/bool.cc"
  link="https://github.com/dart-lang/sdk/blob/b82383953d070e6aaad636413b9fcf06e385e985/runtime/lib/bool.cc#L19-L34"
>}}
```cpp
DEFINE_NATIVE_ENTRY(Bool_fromEnvironment, 0, 3) {
  GET_NON_NULL_NATIVE_ARGUMENT(String, name, arguments->NativeArgAt(1));
  GET_NATIVE_ARGUMENT(Bool, default_value, arguments->NativeArgAt(2));
  // Call the embedder to supply us with the environment.
  const String& env_value =
      String::Handle(Api::GetEnvironmentValue(thread, name));
  if (!env_value.IsNull()) {
    if (Symbols::True().Equals(env_value)) {
      return Bool::True().ptr();
    }
    if (Symbols::False().Equals(env_value)) {
      return Bool::False().ptr();
    }
  }
  return default_value.ptr();
}
```
{{< /markdown-alt >}}

| 💡 You can read more about the pragmas for VM [here](https://github.com/dart-lang/sdk/blob/b82383953d070e6aaad636413b9fcf06e385e985/runtime/docs/pragmas.md).

**_Numbers_**

`Int` type has two variations: small integer ([**`Smi`**](https://github.com/dart-lang/sdk/blob/e4e06c6cbd3aedc57148384592783f39c8edfd30/runtime/vm/object.h#L9992)) and middle integer ([**`Mint`**](https://github.com/dart-lang/sdk/blob/e4e06c6cbd3aedc57148384592783f39c8edfd30/runtime/vm/object.h#L10073)).

Small integer value range is from -(2^N) to 2^N-1 where N = 30 (32-bit build) or N = 62 (64-bit build). Dart uses `Smi` to represent some internal properties of objects, such as the length of lists.

Middle integer value range is from -2^63 to (2^63)-1.

When you write a number into a variable or interact with it, Dart selects a type of that number. If you go beyond the `Smi` size, it automatically converts the type to `Mint`.


| 💡 (2^63)-1 = 9,223,372,036,854,775,807

If the dimension of this number is not enough for you, you can use the built-in complex `BigInt` type.
The number in BigInt is represented internally by a sign, an array of 32-bit unsigned integers in little-endian format, and a number of used digits in that array.

```dart
BigInt maxInt = BigInt.from(9223372036854775807);
BigInt moreThanInt = maxInt + BigInt.parse('12098679128739182365102983');
print(moreThanInt); // 12098688352111219219878790
```

**_Strings_**

Strings in Dart **_are immutable_**, meaning that their contents cannot be changed after they have been created. Any additions or modifications to a string in your code result in the creation of a new string.

The strings have variations: [`OneByteString`](https://github.com/dart-lang/sdk/blob/e4e06c6cbd3aedc57148384592783f39c8edfd30/runtime/vm/object.h#L10531) and [`TwoByteString`](https://github.com/dart-lang/sdk/blob/e4e06c6cbd3aedc57148384592783f39c8edfd30/runtime/vm/object.h#L10670).

The content of the string plays a role in choosing the implementation. If each character in the string is Latin and has a code unit from 0 to 255, then a `OneByteString` will be created because one byte can be allocated for each character of the string for storage. In all other cases, `TwoByteString` is used.

If the characters in the string are more than two bytes (this can happen within UTF-32) it is decomposed into a surrogate pair.

```dart
final clef = String.fromCharCodes([0x1D11E]);
clef.codeUnitAt(0); // 0xD834
clef.codeUnitAt(1); // 0xDD1E
```

Strings also have size restrictions, these are MaxSmi / 2 = 2305843009213693951.

**_Nulls and hashCodes_**

An interesting fact about `true`, `false` and `null` : their hash codes are predefined only in Dart VM.

{{< markdown-alt
  src="runtime/vm/object.h"
  link="https://github.com/dart-lang/sdk/blob/e4e06c6cbd3aedc57148384592783f39c8edfd30/runtime/vm/object.h#L10791-L10794"
>}}
```cpp
// Matches null_patch.dart / bool_patch.dart.
static constexpr intptr_t kNullIdentityHash = 2011;
static constexpr intptr_t kTrueIdentityHash = 1231;
static constexpr intptr_t kFalseIdentityHash = 1237;
```
{{< /markdown-alt >}}

In patches for the web, the `hashCode` is defined by the `Object.hashCode`.

{{< markdown-alt
  src="sdk/lib/\_internal/js_runtime/lib/core_patch.dart"
  link="https://github.com/dart-lang/sdk/blob/e4e06c6cbd3aedc57148384592783f39c8edfd30/sdk/lib/_internal/js_runtime/lib/core_patch.dart#L76-L81"
>}}
```dart
@patch
class Null {
  @patch
  int get hashCode => super.hashCode;
}
```
{{< /markdown-alt >}}

_Therefore, the hashСode values will be randomly generated, but will be strictly defined in the native code. However, this will not have any impact on the functionality of your code._

## Finally

We have studied how the built-in types are implemented in Dart, including their location and structure. We also looked at the differences and limitations that arise when working with them in different implementations. We saw how the patch system mechanism works and understand which libraries are available on the platform.

If you want to continue studying in this direction, I recommend the following links:

- [https://dart.dev/language/built-in-types](https://dart.dev/language/built-in-types) - Preview of built-in types.
- [https://dart.dev/libraries/dart-core](https://dart.dev/libraries/dart-core) - Documentation about `dart:core`.
- [https://github.com/dart-lang/sdk/tree/main/sdk/lib/\_internal](https://github.com/dart-lang/sdk/tree/main/sdk/lib/_internal) - Patches.
- [https://mrale.ph/dartvm](https://mrale.ph/dartvm/) - How the Dart VM is built and works.

Also note that the patch system is used not only for built-in types, but also for asynchronous mechanism and event loop, work with isolates and so on.

Many thanks to **Manojlović Melanija** for help in writing the article.