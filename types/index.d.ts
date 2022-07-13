import { Transform } from 'stream';


declare module 'cloudinary' {

    /****************************** Constants *************************************/
    /******************************
     *  Transformations *******************************/
    type CropMode =
        string
        | "scale"
        | "fit"
        | "limit"
        | "mfit"
        | "fill"
        | "lfill"
        | "pad"
        | "lpad"
        | "mpad"
        | "crop"
        | "thumb"
        | "imagga_crop"
        | "imagga_scale";
    type Gravity =
        string
        | "north_west"
        | "north"
        | "north_east"
        | "west"
        | "center"
        | "east"
        | "south_west"
        | "south"
        | "south_east"
        | "xy_center"
        | "face"
        | "face:center"
        | "face:auto"
        | "faces"
        | "faces:center"
        | "faces:auto"
        | "body"
        | "body:face"
        | "adv_face"
        | "adv_faces"
        | "adv_eyes"
        | "custom"
        | "custom:face"
        | "custom:faces"
        | "custom:adv_face"
        | "custom:adv_faces"
        | "auto"
        | "auto:adv_face"
        | "auto:adv_faces"
        | "auto:adv_eyes"
        | "auto:body"
        | "auto:face"
        | "auto:faces"
        | "auto:custom_no_override"
        | "auto:none"
        | "liquid"
        | "ocr_text";
    type Angle = number | string | Array<number | string> | "auto_right" | "auto_left" | "ignore" | "vflip" | "hflip";
    type ImageEffect =
        string
        | "hue"
        | "red"
        | "green"
        | "blue"
        | "negate"
        | "brightness"
        | "auto_brightness"
        | "brightness_hsb"
        | "sepia"
        | "grayscale"
        | "blackwhite"
        | "saturation"
        | "colorize"
        | "replace_color"
        | "simulate_colorblind"
        | "assist_colorblind"
        | "recolor"
        | "tint"
        | "contrast"
        | "auto_contrast"
        | "auto_color"
        | "vibrance"
        | "noise"
        | "ordered_dither"
        | "pixelate_faces"
        | "pixelate_region"
        | "pixelate"
        | "unsharp_mask"
        | "sharpen"
        | "blur_faces"
        | "blur_region"
        | "blur"
        | "tilt_shift"
        | "gradient_fade"
        | "vignette"
        | "anti_removal"
        | "overlay"
        | "mask"
        | "multiply"
        | "displace"
        | "shear"
        | "distort"
        | "trim"
        | "make_transparent"
        | "shadow"
        | "viesus_correct"
        | "fill_light"
        | "gamma"
        | "improve";

    type VideoEffect = string | "accelerate" | "reverse" | "boomerang" | "loop" | "make_transparent" | "transition";
    type AudioCodec = string | "none" | "aac" | "vorbis" | "mp3";
    type AudioFrequency =
        string
        | number
        | 8000
        | 11025
        | 16000
        | 22050
        | 32000
        | 37800
        | 44056
        | 44100
        | 47250
        | 48000
        | 88200
        | 96000
        | 176400
        | 192000;
    /****************************** Flags *************************************/
    type ImageFlags =
        string
        | Array<string>
        | "any_format"
        | "attachment"
        | "apng"
        | "awebp"
        | "clip"
        | "clip_evenodd"
        | "cutter"
        | "force_strip"
        | "getinfo"
        | "ignore_aspect_ratio"
        | "immutable_cache"
        | "keep_attribution"
        | "keep_iptc"
        | "layer_apply"
        | "lossy"
        | "preserve_transparency"
        | "png8"
        | "png32"
        | "progressive"
        | "rasterize"
        | "region_relative"
        | "relative"
        | "replace_image"
        | "sanitize"
        | "strip_profile"
        | "text_no_trim"
        | "no_overflow"
        | "text_disallow_overflow"
        | "tiff8_lzw"
        | "tiled";
    type VideoFlags =
        string
        | Array<string>
        | "animated"
        | "awebp"
        | "attachment"
        | "streaming_attachment"
        | "hlsv3"
        | "keep_dar"
        | "splice"
        | "layer_apply"
        | "no_stream"
        | "mono"
        | "relative"
        | "truncate_ts"
        | "waveform";
    type ColorSpace = string | "srgb" | "no_cmyk" | "keep_cmyk";
    type DeliveryType =
        string
        | "upload"
        | "private"
        | "authenticated"
        | "fetch"
        | "multi"
        | "text"
        | "asset"
        | "list"
        | "facebook"
        | "twitter"
        | "twitter_name"
        | "instagram"
        | "gravatar"
        | "youtube"
        | "hulu"
        | "vimeo"
        | "animoto"
        | "worldstarhiphop"
        | "dailymotion";
    /****************************** URL *************************************/
    type ResourceType = string | "image" | "raw" | "video";
    type ImageFormat =
        string
        | "gif"
        | "png"
        | "jpg"
        | "bmp"
        | "ico"
        | "pdf"
        | "tiff"
        | "eps"
        | "jpc"
        | "jp2"
        | "psd"
        | "webp"
        | "zip"
        | "svg"
        | "webm"
        | "wdp"
        | "hpx"
        | "djvu"
        | "ai"
        | "flif"
        | "bpg"
        | "miff"
        | "tga"
        | "heic"
    type VideoFormat =
        string
        | "auto"
        | "flv"
        | "m3u8"
        | "ts"
        | "mov"
        | "mkv"
        | "mp4"
        | "mpd"
        | "ogv"
        | "webm"

    export interface CommonTransformationOptions {
        transformation?: TransformationOptions;
        raw_transformation?: string;
        crop?: CropMode;
        width?: number | string;
        height?: number | string;
        size?: string;
        aspect_ratio?: number | string;
        gravity?: Gravity;
        x?: number | string;
        y?: number | string;
        zoom?: number | string;
        effect?: string | Array<number | string>;
        background?: string;
        angle?: Angle;
        radius?: number | string;
        overlay?: string | object;
        custom_function?: string | { function_type: string | "wasm" | "remote", source: string }
        variables?: Array<string | object>;
        if?: string;
        else?: string;
        end_if?: string;
        dpr?: number | string;
        quality?: number | string;
        delay?: number | string;

        [futureKey: string]: any;
    }

    export interface ImageTransformationOptions extends CommonTransformationOptions {
        underlay?: string | Object;
        color?: string;
        color_space?: ColorSpace;
        opacity?: number | string;
        border?: string;
        default_image?: string;
        density?: number | string;
        format?: ImageFormat;
        fetch_format?: ImageFormat;
        effect?: string | Array<number | string> | ImageEffect;
        page?: number | string;
        flags?: ImageFlags | string;

        [futureKey: string]: any;
    }

    interface VideoTransformationOptions extends CommonTransformationOptions {
        audio_codec?: AudioCodec;
        audio_frequency?: AudioFrequency;
        video_codec?: string | Object;
        bit_rate?: number | string;
        fps?: string | Array<number | string>;
        keyframe_interval?: string;
        offset?: string,
        start_offset?: number | string;
        end_offset?: number | string;
        duration?: number | string;
        streaming_profile?: StreamingProfiles
        video_sampling?: number | string;
        format?: VideoFormat;
        fetch_format?: VideoFormat;
        effect?: string | Array<number | string> | VideoEffect;
        flags?: VideoFlags;

        [futureKey: string]: any;
    }

    interface TextStyleOptions {
        text_style?: string;
        font_family?: string;
        font_size?: number;
        font_color?: string;
        font_weight?: string;
        font_style?: string;
        background?: string;
        opacity?: number;
        text_decoration?: string
    }

    interface ConfigOptions {
        cloud_name?: string;
        api_key?: string;
        api_secret?: string;
        api_proxy?: string;
        oauth_token?: string;

        [futureKey: string]: any;
    }

    export interface ResourceOptions {
        type?: string;
        resource_type?: string;
    }

    /****************************** Admin API Options *************************************/
    export interface AdminApiOptions {
        agent?: object;
        content_type?: string;
        oauth_token?: string;

        [futureKey: string]: any;
    }

    export interface ArchiveApiOptions {
        allow_missing?: boolean;
        async?: boolean;
        expires_at?: number;
        flatten_folders?: boolean;
        keep_derived?: boolean;
        mode?: string;
        notification_url?: string;
        prefixes?: string;
        public_ids?: string[] | string;
        fully_qualified_public_ids?: string[] | string;
        tags?: string | string[];
        target_format?: TargetArchiveFormat;
        target_public_id?: string;
        target_tags?: string[];
        timestamp?: number;
        type?: DeliveryType
        use_original_filename?: boolean;

        [futureKey: string]: any;
    }

    export interface UpdateApiOptions extends ResourceOptions {
        access_control?: string[];
        auto_tagging?: number;
        background_removal?: string;
        categorization?: string;
        context?: boolean | string;
        custom_coordinates?: string;
        detection?: string;
        face_coordinates?: string;
        headers?: string;
        notification_url?: string;
        ocr?: string;
        raw_convert?: string;
        similarity_search?: string;
        tags?: string | string[];
        moderation_status?: string;
        unsafe_update?: object;
        allowed_for_strict?: boolean;

        [futureKey: string]: any;
    }

    export interface ResourceApiOptions extends ResourceOptions {
        transformation?: TransformationOptions;
        next_cursor?: boolean | string;
        public_ids?: string[];
        prefix?: string;
        all?: boolean;
        max_results?: number;
        tags?: boolean;
        tag?: string;
        context?: boolean;
        direction?: number | string;
        moderations?: boolean;
        start_at?: string;
        colors?: boolean;
        derived_next_cursor?: string;
        faces?: boolean;
        image_metadata?: boolean;
        pages?: boolean;
        coordinates?: boolean;
        phash?: boolean;
        cinemagraph_analysis?: boolean;
        accessibility_analysis?: boolean;

        [futureKey: string]: any;
    }

    export interface UploadApiOptions {
        allowed_formats?: Array<VideoFormat> | Array<ImageFormat>;
        async?: boolean;
        backup?: boolean;
        callback?: string;
        colors?: boolean;
        discard_original_filename?: boolean;
        eager?: TransformationOptions;
        eval?: string;
        faces?: boolean;
        filename_override?: string;
        folder?: string;
        format?: VideoFormat | ImageFormat;
        image_metadata?: boolean;
        invalidate?: boolean;
        moderation?: ModerationKind;
        notification_url?: string;
        overwrite?: boolean;
        phash?: boolean;
        proxy?: string;
        public_id?: string;
        quality_analysis?: boolean;
        return_delete_token?: boolean
        timestamp?: number;
        transformation?: TransformationOptions;
        type?: DeliveryType;
        unique_filename?: boolean;
        use_filename?: boolean;
        chunk_size?: number;
        disable_promises?: boolean;
        oauth_token?: string;

        [futureKey: string]: any;
    }


    type TransformationOptions =
        string
        | string[]
        | VideoTransformationOptions
        | ImageTransformationOptions
        | Object
        | Array<ImageTransformationOptions>
        | Array<VideoTransformationOptions>;

    type ImageAndVideoFormatOptions = ImageFormat | VideoFormat;
    type AdminAndResourceOptions = AdminApiOptions | ResourceApiOptions;
    type AdminAndUpdateApiOptions = AdminApiOptions | UpdateApiOptions;

    /****************************** API *************************************/
    type Status = string | "pending" | "approved" | "rejected";
    type StreamingProfiles = string | "4k" | "full_hd" | "hd" | "sd" | "full_hd_wifi" | "full_hd_lean" | "hd_lean";
    type ModerationKind = string | "manual" | "webpurify" | "aws_rek" | "metascan";
    type TargetArchiveFormat = string | "zip" | "tgz";

    // err is kept for backwards compatibility, it currently will always be undefined
    type ResponseCallback = (err?: any, callResult?: any) => any;

    type UploadResponseCallback = (err?: UploadApiErrorResponse, callResult?: UploadApiResponse) => void;

    export interface UploadApiResponse {
        public_id: string;
        version: number;
        signature: string;
        width: number;
        height: number;
        format: string;
        resource_type: string;
        created_at: string;
        tags: Array<string>;
        pages: number;
        bytes: number;
        type: string;
        etag: string;
        placeholder: boolean;
        url: string;
        secure_url: string;
        original_filename: string;
        moderation: Array<string>;
        access_control: Array<string>;
        context: object;
        metadata: object;

        [futureKey: string]: any;
    }

    export interface UploadApiErrorResponse {
        message: string;
        name: string;
        http_code: number;

        [futureKey: string]: any;
    }

    class UploadStream extends Transform {
    }

    export interface DeleteApiResponse {
        message: string;
        http_code: number;
    }

    export interface MetadataFieldApiOptions {
        external_id?: string;
        type?: string;
        label?: string;
        mandatory?: boolean;
        default_value?: number;
        validation?: object;
        datasource?: object;

        [futureKey: string]: any;
    }

    export interface MetadataFieldApiResponse {
        external_id: string;
        type: string;
        label: string;
        mandatory: boolean;
        default_value: number;
        validation: object;
        datasource: object;

        [futureKey: string]: any;
    }

    export interface MetadataFieldsApiResponse {
        metadata_fields: MetadataFieldApiResponse[]
    }

    export interface DatasourceChange {
        values: Array<object>
    }

    export interface ResourceApiResponse {
        resources: [
            {
                public_id: string;
                format: string;
                version: number;
                resource_type: string;
                type: string;
                placeholder: boolean;
                created_at: string;
                bytes: number;
                width: number;
                height: number;
                backup: boolean;
                url: string;
                secure_url: string;
                tags: Array<string>;
                context: object;
                next_cursor: string;
                derived_next_cursor: string;
                image_metadata: object;
                faces: number[][];
                quality_analysis: number;
                colors: string[][];
                derived: Array<string>;
                moderation: object;
                phash: string;
                predominant: object;
                coordinates: object;
                access_control: Array<string>;
                pages: number;

                [futureKey: string]: any;
            }
        ]
    }


    export namespace cloudinary {

        /****************************** Global Utils *************************************/

        function config(new_config?: boolean | ConfigOptions): ConfigOptions;

        function config<K extends keyof ConfigOptions, V extends ConfigOptions[K]>(key: K, value?: undefined): V;

        function config<K extends keyof ConfigOptions, V extends ConfigOptions[K]>(key: K, value: V): ConfigOptions & { [Property in K]: V }

        /****************************** Utils *************************************/

        namespace utils {

            function sign_request(params_to_sign: object, options?: ConfigOptions): { signature: string; api_key: string; [key:string]:any};

            function api_sign_request(params_to_sign: object, api_secret: string): string;

            function verifyNotificationSignature(body: string, timestamp: number, signature: string, valid_for?: number): boolean;


            function archive_params(options?: ArchiveApiOptions): Promise<any>;

            function downloadArchiveUrl(options?: ArchiveApiOptions): string

            function downloadZipUrl(options?: ArchiveApiOptions): string;

            function webhook_signature(data?: string, timestamp?: number, options?: ConfigOptions): string;

            function privateDownloadUrl(publicID: string, format:string, options: Partial<{
                resource_type: ResourceType;
                type: DeliveryType;
                expires_at: number;
                attachment: boolean;
            }>): string;
        }

        /****************************** Admin API Methods *************************************/

        namespace api {
            function deleteResources(value: string[], options?: AdminAndResourceOptions, callback?: ResponseCallback): Promise<any>;

            function deleteResourcesByPrefix(prefix: string, options?: AdminAndResourceOptions, callback?: ResponseCallback): Promise<any>;

            function deleteResourcesByTag(tag: string, options?: AdminAndResourceOptions, callback?: ResponseCallback): Promise<any>;

            function ping(options?: AdminApiOptions, callback?: ResponseCallback): Promise<any>;

            function resource(public_id: string, options?: AdminAndResourceOptions, callback?: ResponseCallback): Promise<any>;

            function resources(options?: AdminAndResourceOptions, callback?: ResponseCallback): Promise<any>;

            function resourcesByContext(key: string, value?: string, options?: AdminAndResourceOptions, callback?: ResponseCallback): Promise<ResourceApiResponse>;

            function resourcesByAssetIds(asset_ids: string[] | string, options?: AdminAndResourceOptions, callback?: ResponseCallback): Promise<ResourceApiResponse>;

            function resourcesByTag(public_ids: string[] | string, options?: AdminAndResourceOptions, callback?: ResponseCallback): Promise<ResourceApiResponse>;

            function resourcesByModeration(moderation: ModerationKind, status: Status, options?: AdminAndResourceOptions, callback?: ResponseCallback): Promise<ResourceApiResponse>;

            function resourcesByTag(tag: string, options?: AdminAndResourceOptions, callback?: ResponseCallback): Promise<ResourceApiResponse>;

            function restore(public_ids: string[], options?: AdminApiOptions | { resource_type: ResourceType, type: DeliveryType }, callback?: ResponseCallback): Promise<any>;

            function rootFolders(callback?: ResponseCallback, options?: AdminApiOptions): Promise<any>;

            function search(params: string, options?: AdminApiOptions, callback?: ResponseCallback): Promise<any>;

            function subFolders(root_folder: string, options?: AdminApiOptions, callback?: ResponseCallback): Promise<any>;

            function tags(options?: AdminApiOptions | { max_results?: number, next_cursor?: string, prefix?: string }, callback?: ResponseCallback): Promise<any>;

            function update(public_id: string, options?: AdminAndUpdateApiOptions, callback?: ResponseCallback): Promise<any>;

            function updateUploadMapping(name: string, options: AdminApiOptions | { template: string }, callback?: ResponseCallback): Promise<any>;

            function uploadMapping(name?: string, options?: AdminApiOptions, callback?: ResponseCallback): Promise<any>;

            function uploadMappings(options?: AdminApiOptions | { max_results?: number, next_cursor?: string }, callback?: ResponseCallback): Promise<any>;

            function usage(callback?: ResponseCallback, options?: AdminApiOptions): Promise<any>;

            function usage(options?: AdminApiOptions): Promise<any>;

            function createFolder(path:string, options?: AdminApiOptions, callback?: ResponseCallback): Promise<any>;

            function deleteFolder(path:string, options?: AdminApiOptions, callback?: ResponseCallback): Promise<any>;

            /****************************** Structured Metadata API Methods *************************************/

            function addMetadataField(field: MetadataFieldApiOptions, options?: AdminApiOptions, callback?: ResponseCallback): Promise<MetadataFieldApiResponse>;

            function deleteMetadataField(field_external_id: string, options?: AdminApiOptions, callback?: ResponseCallback): Promise<DeleteApiResponse>;

            function metadataFieldByFieldId(external_id:string, options?: AdminApiOptions, callback?: ResponseCallback): Promise<MetadataFieldApiResponse>;

            function updateMetadataField(external_id: string, field: MetadataFieldApiOptions, options?: AdminApiOptions, callback?: ResponseCallback): Promise<MetadataFieldApiResponse>;

            function updateMetadataFieldDatasource(field_external_id: string, entries_external_id: object, options?: AdminApiOptions, callback?: ResponseCallback): Promise<DatasourceChange>;

            function deleteDatasourceEntries(field_external_id: string, entries_external_id: string[], options?: AdminApiOptions, callback?: ResponseCallback): Promise<DatasourceChange>;

            function restoreMetadataFieldDatasource(field_external_id: string, entries_external_id: string[], options?: AdminApiOptions, callback?: ResponseCallback): Promise<DatasourceChange>;

        }

        /****************************** Upload API Methods *************************************/

        namespace uploader {
            function addContext(context: string, public_ids: string[], options?: { type?: DeliveryType, resource_type?: ResourceType }, callback?: ResponseCallback): Promise<any>;

            function addTag(tag: string, public_ids: string[], options?: { type?: DeliveryType, resource_type?: ResourceType }, callback?: ResponseCallback): Promise<any>;

            function createArchive(options?: ArchiveApiOptions, target_format?: TargetArchiveFormat, callback?: ResponseCallback,): Promise<any>;

            function createZip(options?: ArchiveApiOptions, callback?: ResponseCallback): Promise<any>;

            function destroy(public_id: string, options?: { resource_type?: ResourceType, type?: DeliveryType, invalidate?: boolean }, callback?: ResponseCallback,): Promise<any>;

            function explicit(public_id: string, options?: UploadApiOptions, callback?: ResponseCallback): Promise<any>;

            function removeAllContext(public_ids: string[], options?: { context?: string, resource_type?: ResourceType, type?: DeliveryType }, callback?: ResponseCallback): Promise<any>;

            function removeAllTags(public_ids: string[], options?: { tag?: string, resource_type?: ResourceType, type?: DeliveryType }, callback?: ResponseCallback): Promise<any>;

            function removeTag(tag: string, public_ids: string[], options?: { tag?: string, resource_type?: ResourceType, type?: DeliveryType }, callback?: ResponseCallback): Promise<any>;

            function rename(from_public_id: string, to_public_id: string, options?: { resource_type?: ResourceType, type?: DeliveryType, to_type?: DeliveryType, overwrite?: boolean, invalidate?: boolean }, callback?: ResponseCallback): Promise<any>;

            function replaceTag(tag: string, public_ids: string[], options?: { resource_type?: ResourceType, type?: DeliveryType }, callback?: ResponseCallback): Promise<any>;

            function upload(file: string, options?: UploadApiOptions, callback?: UploadResponseCallback): Promise<UploadApiResponse>;

            function uploadChunked(path: string, options?: UploadApiOptions, callback?: UploadResponseCallback): Promise<UploadApiResponse>;

            function uploadChunkedStream(options?: UploadApiOptions, callback?: UploadResponseCallback): UploadStream;

            function uploadLarge(path: string, options?: UploadApiOptions, callback?: UploadResponseCallback): Promise<UploadApiResponse>;

            function uploadStream(options?: UploadApiOptions, callback?: UploadResponseCallback): UploadStream;

            /****************************** Structured Metadata API Methods *************************************/

            function updateMetadata(metadata: string | object, public_ids: string[], options?:UploadApiOptions, callback?: ResponseCallback): Promise<MetadataFieldApiResponse>;
        }

        /****************************** Search API *************************************/

        class search {

            aggregate(value?: string): search;

            execute(): Promise<any>;

            expression(value?: string): search;

            maxResults(value?: number): search;

            nextCursor(value?: string): search;

            sortBy(key: string, value: 'asc' | 'desc'): search;

            toQuery(value?: string): search;

            withField(value?: string): search;

            static aggregate(args?: string): search;

            static expression(args?: string): search;

            static instance(args?: string): search;

            static maxResults(args?: number): search;

            static nextCursor(args?: string): search;

            static sortBy(key: string, value: 'asc' | 'desc'): search;

            static withField(args?: string): search;
        }
    }
}
